import { ChannelType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DateTime } from 'luxon';
import { EPHEMERAL } from '../constants/discordFlags.js';
import { DND_AVAILABILITY_COOLDOWN_MS } from '../constants/limits.js';
import { MENTION_NONE, mentionOnlyRoles } from '../constants/safeMentions.js';
import { PLAYERS_ROLE_NAME } from '../constants/roles.js';
import { tryConsumeCooldown } from '../services/commandCooldown.js';
import { isAdminMember } from '../guards/admin.js';

const REACT_ATTEND = '✅';
const REACT_CANT = '❌';

const WHEN_PRESET = 'next_sunday_7pm_eastern';
const WHEN_CUSTOM = 'custom';

const EMBED_TITLE = 'D&D availability';

/** @param {number} hour12 @param {'am' | 'pm'} ampm */
function toHour24(hour12, ampm) {
	if (ampm === 'am') {
		return hour12 === 12 ? 0 : hour12;
	}
	return hour12 === 12 ? 12 : hour12 + 12;
}

/** Next Sunday 7:00 PM in America/New_York; if that instant is in the past, the following Sunday. */
function getNextSunday7pmEasternUnix() {
	const zone = 'America/New_York';
	const now = DateTime.now().setZone(zone);
	const targetDow = 7;
	const daysUntil = (targetDow - now.weekday + 7) % 7;
	let candidate = now.plus({ days: daysUntil }).set({ hour: 19, minute: 0, second: 0, millisecond: 0 });
	if (candidate <= now) {
		candidate = candidate.plus({ weeks: 1 });
	}
	return Math.floor(candidate.toSeconds());
}

/**
 * @param {string} dateStr YYYY-MM-DD
 * @param {number} hour12 1–12
 * @param {number} minute 0, 15, 30, or 45
 * @param {'am' | 'pm'} ampm
 * @returns {{ ok: true, unix: number } | { ok: false, error: string }}
 */
function parseCustomEasternUnix(dateStr, hour12, minute, ampm) {
	const trimmed = dateStr.trim();
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
	if (!m) {
		return { ok: false, error: 'Use **YYYY-MM-DD** for **session_date** (custom mode).' };
	}
	const year = Number(m[1]);
	const month = Number(m[2]);
	const day = Number(m[3]);
	const hour24 = toHour24(hour12, ampm);
	const dt = DateTime.fromObject(
		{ year, month, day, hour: hour24, minute, second: 0, millisecond: 0 },
		{ zone: 'America/New_York' },
	);
	if (!dt.isValid) {
		return { ok: false, error: `Invalid date or time (${dt.invalidExplanation || dt.invalidReason || 'unknown'}).` };
	}
	return { ok: true, unix: Math.floor(dt.toSeconds()) };
}

export const data = new SlashCommandBuilder()
	.setName('check-dnd-availability')
	.setDescription('Post a session availability poll (✅/❌) and ping @Players')
	.setDMPermission(false)
	.addStringOption((opt) =>
		opt
			.setName('when')
			.setDescription('Session date & time (stored as US Eastern; shown per-user in Discord)')
			.setRequired(true)
			.addChoices(
				{ name: 'Next Sunday — 7:00 PM Eastern (auto)', value: WHEN_PRESET },
				{ name: 'Custom date & time (Eastern)', value: WHEN_CUSTOM },
			),
	)
	.addStringOption((opt) =>
		opt
			.setName('session_date')
			.setDescription('Custom only: date as YYYY-MM-DD (US Eastern)')
			.setRequired(false),
	)
	.addIntegerOption((opt) =>
		opt
			.setName('hour')
			.setDescription('Custom only: hour on a 12-hour clock (1–12)')
			.setRequired(false)
			.setMinValue(1)
			.setMaxValue(12),
	)
	.addIntegerOption((opt) =>
		opt
			.setName('minute')
			.setDescription('Custom only')
			.setRequired(false)
			.addChoices(
				{ name: ':00', value: 0 },
				{ name: ':15', value: 15 },
				{ name: ':30', value: 30 },
				{ name: ':45', value: 45 },
			),
	)
	.addStringOption((opt) =>
		opt
			.setName('am_pm')
			.setDescription('Custom only: AM or PM')
			.setRequired(false)
			.addChoices(
				{ name: 'AM', value: 'am' },
				{ name: 'PM', value: 'pm' },
			),
	);

/**
 * Native Discord “poll” objects aren’t available in this bot’s discord.js surface yet,
 * so this posts an embed and adds ✅ / ❌ reactions — same two fixed answers.
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	await interaction.deferReply({ flags: EPHEMERAL });

	if (!interaction.inGuild() || interaction.channel?.type === ChannelType.DM) {
		await interaction.editReply({ content: 'Use this command in a server text channel.', allowedMentions: MENTION_NONE });
		return;
	}

	const guild = interaction.guild;
	const guildId = interaction.guildId;
	const authorId = interaction.user.id;
	if (!guild || !guildId) {
		await interaction.editReply({ content: 'Could not resolve this server.', allowedMentions: MENTION_NONE });
		return;
	}

	if (!isAdminMember(interaction)) {
		await interaction.editReply({
			content: 'Restricted: only **Admin** (role or Administrator permission) can use this command.',
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	const channel = interaction.channel;
	if (!channel || !channel.isTextBased()) {
		await interaction.editReply({ content: 'I can’t post polls in this channel type.', allowedMentions: MENTION_NONE });
		return;
	}

	let playersRole = guild.roles.cache.find((r) => r.name.toLowerCase() === PLAYERS_ROLE_NAME);
	if (!playersRole) {
		try {
			await guild.roles.fetch();
		}
		catch {
			// ignore; we’ll try cache again
		}
		playersRole = guild.roles.cache.find((r) => r.name.toLowerCase() === PLAYERS_ROLE_NAME);
	}
	if (!playersRole) {
		await interaction.editReply({
			content: `I couldn’t find a **${PLAYERS_ROLE_NAME}** role. Create one (name it **Players**) or rename an existing role to match.`,
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	const cdKey = `${guildId}:${authorId}:dnd`;
	const cd = tryConsumeCooldown(cdKey, DND_AVAILABILITY_COOLDOWN_MS);
	if (!cd.ok) {
		const sec = Math.ceil(cd.retryAfterMs / 1000);
		await interaction.editReply({
			content: `Slow down — you can post another poll in **${sec}s**.`,
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	const when = interaction.options.getString('when', true);
	let unix;
	let scheduleNote;

	if (when === WHEN_PRESET) {
		unix = getNextSunday7pmEasternUnix();
		scheduleNote =
			'_Preset: **next Sunday** at **7:00 PM US Eastern** (EST/EDT). The times below use **your** Discord client timezone._';
	}
	else {
		const sessionDate = interaction.options.getString('session_date');
		const hour = interaction.options.getInteger('hour');
		const minute = interaction.options.getInteger('minute');
		/** @type {'am' | 'pm' | null} */
		const amPm = interaction.options.getString('am_pm');
		if (!sessionDate || hour == null || minute == null || !amPm) {
			await interaction.editReply({
				content:
					'For **Custom**, set **session_date** (YYYY-MM-DD), **hour** (1–12), **minute** (:00 / :15 / :30 / :45), and **am_pm** — all interpreted in **US Eastern**.',
				allowedMentions: MENTION_NONE,
			});
			return;
		}
		const parsed = parseCustomEasternUnix(sessionDate, hour, minute, amPm);
		if (!parsed.ok) {
			await interaction.editReply({ content: parsed.error, allowedMentions: MENTION_NONE });
			return;
		}
		unix = parsed.unix;
		scheduleNote =
			'_Custom time was entered in **US Eastern** (America/New_York, EST/EDT). The lines below appear in **your** local timezone in Discord._';
	}

	const whenBlock = `**When**\n<t:${unix}:F>\n<t:${unix}:R>`;

	const embed = new EmbedBuilder()
		.setTitle(EMBED_TITLE)
		.setColor(0x9B59B6)
		.setDescription(`${whenBlock}\n\n${scheduleNote}\n\nReact with ${REACT_ATTEND} or ${REACT_CANT} below.`)
		.setTimestamp()
		.setFooter({ text: `${REACT_ATTEND} I can attend · ${REACT_CANT} I can't attend` });

	const content = `<@&${playersRole.id}> — **D&D availability**`;

	try {
		const msg = await channel.send({
			content,
			embeds: [embed],
			allowedMentions: mentionOnlyRoles(playersRole.id),
		});
		await msg.react(REACT_ATTEND);
		await msg.react(REACT_CANT);

		await interaction.editReply({
			content: `Posted for <t:${unix}:f>. [Jump to poll](${msg.url})`,
			allowedMentions: MENTION_NONE,
		});
	}
	catch (err) {
		console.error(err);
		await interaction.editReply({
			content: 'Could not post the poll (missing permissions: Send Messages, Embed Links, Add Reactions, or Mention This Role?).',
			allowedMentions: MENTION_NONE,
		});
	}
}

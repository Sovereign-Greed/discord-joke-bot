import { ChannelType, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { DND_AVAILABILITY_COOLDOWN_MS } from '../constants/limits.js';
import { MENTION_NONE, mentionOnlyRoles } from '../constants/safeMentions.js';
import { PLAYERS_ROLE_NAME } from '../constants/roles.js';
import { tryConsumeCooldown } from '../functions/commandCooldown.js';
import { isAdminMember } from '../functions/isAdminMember.js';

const REACT_ATTEND = '✅';
const REACT_CANT = '❌';

export const data = new SlashCommandBuilder()
	.setName('check-dnd-availability')
	.setDescription('Post a session availability poll (✅/❌) and ping @Players')
	.setDMPermission(false)
	.addStringOption((opt) =>
		opt
			.setName('title')
			.setDescription('Poll title (e.g. "Session 12 — The Dragon\'s Vault")')
			.setRequired(true)
			.setMaxLength(200),
	)
	.addStringOption((opt) =>
		opt
			.setName('date')
			.setDescription('When? (e.g. "Sat Apr 18, 7pm EST" or "2026-04-18")')
			.setRequired(false)
			.setMaxLength(200),
	)
	.addStringOption((opt) =>
		opt
			.setName('note')
			.setDescription('Optional extra context (location, level range, etc.)')
			.setRequired(false)
			.setMaxLength(400),
	);

/**
 * Native Discord “poll” objects aren’t available in this bot’s discord.js surface yet,
 * so this posts an embed and adds ✅ / ❌ reactions — same two fixed answers.
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	await interaction.deferReply({ ephemeral: true });

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

	const title = interaction.options.getString('title', true);
	const dateStr = interaction.options.getString('date');
	const note = interaction.options.getString('note');

	const embed = new EmbedBuilder()
		.setTitle(title)
		.setColor(0x9B59B6)
		.setTimestamp()
		.setFooter({ text: `${REACT_ATTEND} I can attend · ${REACT_CANT} I can't attend` });

	const descParts = [];
	if (dateStr) {
		descParts.push(`**When:** ${dateStr}`);
	}
	if (note) {
		descParts.push(`**Details:** ${note}`);
	}
	embed.setDescription(
		descParts.length ? descParts.join('\n\n') : `React with ${REACT_ATTEND} or ${REACT_CANT} below.`,
	);

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
			content: `Posted. [Jump to poll](${msg.url})`,
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

import { ChannelType, SlashCommandBuilder } from 'discord.js';
import { MENTION_NONE, mentionOnlyUsers } from '../constants/safeMentions.js';
import { isAdminMember } from '../guards/admin.js';
import { tryConsumeTimerCooldown } from '../services/timerCooldown.js';

const MAX_SECONDS = 270;

export const data = new SlashCommandBuilder()
	.setName('timer')
	.setDescription('Start a timer and ping someone when it finishes')
	.addUserOption((opt) =>
		opt
			.setName('user')
			.setDescription('Who to ping when time is up')
			.setRequired(true),
	)
	.addIntegerOption((opt) =>
		opt
			.setName('seconds')
			.setDescription(`Timer length in seconds (max ${MAX_SECONDS})`)
			.setRequired(true)
			.setMinValue(1)
			.setMaxValue(MAX_SECONDS),
	);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	const target = interaction.options.getUser('user', true);
	const seconds = interaction.options.getInteger('seconds', true);

	if (!interaction.inGuild() || interaction.channel?.type === ChannelType.DM) {
		await interaction.reply({ content: 'Timers only work inside a server channel.', allowedMentions: MENTION_NONE });
		return;
	}

	const guildId = interaction.guildId;
	const authorId = interaction.user.id;
	if (!guildId) {
		await interaction.reply({ content: 'Timers only work inside a server channel.', allowedMentions: MENTION_NONE });
		return;
	}

	if (!isAdminMember(interaction)) {
		await interaction.reply({
			content: 'Restricted: only admins can use `/timer`.',
			ephemeral: true,
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	const channel = interaction.channel;
	if (!channel || !channel.isTextBased()) {
		await interaction.reply({ content: 'I can’t post timer pings in this channel type.', ephemeral: true, allowedMentions: MENTION_NONE });
		return;
	}

	const cooldown = tryConsumeTimerCooldown(guildId, authorId);
	if (!cooldown.ok) {
		const sec = Math.ceil(cooldown.retryAfterMs / 1000);
		await interaction.reply({
			content: `Slow down — you can start another timer in **${sec}s**.`,
			ephemeral: true,
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	await interaction.reply({
		content: `⏱️ Timer started for <@${target.id}>: **${seconds}s**.`,
		allowedMentions: mentionOnlyUsers(target.id),
	});

	setTimeout(async () => {
		try {
			await channel.send({
				content: `⏰ Time’s up, <@${target.id}>!`,
				allowedMentions: mentionOnlyUsers(target.id),
			});
		}
		catch (err) {
			console.error('Failed to send timer ping:', err);
		}
	}, seconds * 1000);
}

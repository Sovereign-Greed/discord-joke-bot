import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from 'discord.js';

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
		await interaction.reply('Timers only work inside a server channel.');
		return;
	}

	const hasAdminPermission = Boolean(interaction.memberPermissions?.has(PermissionFlagsBits.Administrator));
	const hasAdminRole = Boolean(interaction.member?.roles?.cache?.some((r) => r.name.toLowerCase() === 'admin'));
	if (!hasAdminPermission && !hasAdminRole) {
		await interaction.reply({
			content: 'Restricted: only admins can use `/timer`.',
			ephemeral: true,
		});
		return;
	}

	const channel = interaction.channel;
	if (!channel || !channel.isTextBased()) {
		await interaction.reply({ content: 'I can’t post timer pings in this channel type.', ephemeral: true });
		return;
	}

	await interaction.reply({
		content: `⏱️ Timer started for <@${target.id}>: **${seconds}s**.`,
		allowedMentions: { users: [target.id] },
	});

	setTimeout(async () => {
		try {
			await channel.send({
				content: `⏰ Time’s up, <@${target.id}>!`,
				allowedMentions: { users: [target.id] },
			});
		}
		catch (err) {
			console.error('Failed to send timer ping:', err);
		}
	}, seconds * 1000);
}


import { EPHEMERAL } from '../constants/discordFlags.js';
import { MENTION_NONE } from '../constants/safeMentions.js';

/**
 * Central error reply for slash commands (used by the interaction event).
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {unknown} err
 */
export async function handleSlashCommandError(interaction, err) {
	console.error(err);
	const payload = {
		content: 'Something went wrong running that command.',
		flags: EPHEMERAL,
		allowedMentions: MENTION_NONE,
	};
	if (interaction.replied || interaction.deferred) {
		await interaction.followUp(payload);
	}
	else {
		await interaction.reply(payload);
	}
}

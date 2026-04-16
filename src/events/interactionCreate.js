import { Events } from 'discord.js';
import { handleChatInputCommand } from '../commands/index.js';
import { handleSlashCommandError } from '../middleware/interactionError.js';

export default {
	name: Events.InteractionCreate,
	once: false,
	/**
	 * @param {import('discord.js').BaseInteraction} interaction
	 */
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) {
			return;
		}

		try {
			await handleChatInputCommand(interaction);
		}
		catch (err) {
			await handleSlashCommandError(interaction, err);
		}
	},
};

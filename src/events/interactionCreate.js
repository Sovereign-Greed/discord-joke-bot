import { Events } from 'discord.js';
import { handleChatInputCommand } from '../commands/index.js';

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
			console.error(err);
			const payload = { content: 'Something went wrong running that command.', ephemeral: true };
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp(payload);
			}
			else {
				await interaction.reply(payload);
			}
		}
	},
};

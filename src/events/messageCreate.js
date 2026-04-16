import { Events } from 'discord.js';
import { handleMessageCreate } from '../functions/handleMessageCreate.js';

export default {
	name: Events.MessageCreate,
	once: false,
	/**
	 * @param {import('discord.js').Message} message
	 */
	async execute(message) {
		await handleMessageCreate(message);
	},
};

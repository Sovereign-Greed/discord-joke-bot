import { Events } from 'discord.js';
import { handleMessageCreate } from '../handlers/messageCreateHandler.js';

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

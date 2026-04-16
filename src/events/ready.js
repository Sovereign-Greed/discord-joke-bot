import { Events } from 'discord.js';
import { getEnv } from '../env.js';

export default {
	name: Events.ClientReady,
	once: true,
	/**
	 * @param {import('discord.js').Client<true>} client
	 */
	execute(client) {
		const { applicationId } = getEnv();
		console.log(`Logged in as ${client.user.tag}!`);
		if (client.user.id !== applicationId) {
			console.warn(
				`APPLICATION_ID in .env (${applicationId}) does not match this bot's user ID (${client.user.id}). ` +
					'Copy the Application ID from the Discord Developer Portal → General Information.',
			);
		}
	},
};

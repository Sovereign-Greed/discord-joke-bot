import { Events } from 'discord.js';
import { handleChatInputCommand } from '../commands/index.js';
import {
	SLASH_RATE_MAX_PER_USER,
	SLASH_RATE_WINDOW_MS,
} from '../constants/limits.js';
import { EPHEMERAL } from '../constants/discordFlags.js';
import { MENTION_NONE } from '../constants/safeMentions.js';
import { handleSlashCommandError } from '../middleware/interactionError.js';
import { allowRateLimit } from '../services/simpleRateLimiter.js';

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

		const userKey = `slash:${interaction.user.id}`;
		if (!allowRateLimit(userKey, SLASH_RATE_MAX_PER_USER, SLASH_RATE_WINDOW_MS)) {
			try {
				await interaction.reply({
					content: 'Too many commands too fast — wait a few seconds and try again.',
					flags: EPHEMERAL,
					allowedMentions: MENTION_NONE,
				});
			}
			catch {
				// ignore (duplicate / expired interaction)
			}
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

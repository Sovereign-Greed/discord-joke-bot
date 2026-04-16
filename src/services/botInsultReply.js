import { INSULT_SUBSTRINGS, INSULT_WITTY_REPLIES } from '../constants/botInsults.js';
import { isDirectedAtBot } from '../guards/directedAtBot.js';

/**
 * @param {import('discord.js').Message} message
 * @param {string} normalized
 * @returns {string | null}
 */
export function pickDirectedBotInsultReply(message, normalized) {
	if (!isDirectedAtBot(message, normalized)) {
		return null;
	}

	const hasInsult = INSULT_SUBSTRINGS.some((t) => normalized.includes(t));
	if (!hasInsult) {
		return null;
	}

	const idx = Math.floor(Math.random() * INSULT_WITTY_REPLIES.length);
	return INSULT_WITTY_REPLIES[idx];
}

import { BOT_ALIAS_SUBSTRINGS, INSULT_SUBSTRINGS, INSULT_WITTY_REPLIES } from '../constants/botInsults.js';

/**
 * @param {import('discord.js').Message} message
 * @param {string} normalized
 * @returns {string | null}
 */
export function pickDirectedBotInsultReply(message, normalized) {
	const botId = message.client.user?.id;
	const mentioned = Boolean(botId && message.mentions.users.has(botId));
	const byName = BOT_ALIAS_SUBSTRINGS.some((a) => normalized.includes(a));
	if (!mentioned && !byName) {
		return null;
	}

	const hasInsult = INSULT_SUBSTRINGS.some((t) => normalized.includes(t));
	if (!hasInsult) {
		return null;
	}

	const idx = Math.floor(Math.random() * INSULT_WITTY_REPLIES.length);
	return INSULT_WITTY_REPLIES[idx];
}

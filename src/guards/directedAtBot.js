import { BOT_ALIAS_SUBSTRINGS } from '../constants/botInsults.js';

const BOT_ALIAS_RE = /\bjoke[- ]?bot\b|\bjokebot\b/i;
const DIRECT_ADDRESS_PREFIX_RE = /^\s*(?:hey|hi|hello|yo|ok|okay|listen)?\s*(?:joke[- ]?bot|jokebot)\b[\s,.:!?-]*/i;

/**
 * Best-effort heuristic: only treat as "directed at bot" if the user @mentions the bot
 * OR clearly addresses it by name (as a direct addressee, not a 3rd-person reference).
 *
 * @param {import('discord.js').Message} message
 * @param {string} normalized lowercase content
 */
export function isDirectedAtBot(message, normalized) {
	const botId = message.client.user?.id;
	const mentioned = Boolean(botId && message.mentions.users.has(botId));
	if (mentioned) {
		return true;
	}

	if (!BOT_ALIAS_RE.test(normalized)) {
		return false;
	}

	if (DIRECT_ADDRESS_PREFIX_RE.test(normalized)) {
		return true;
	}

	const endsWithAlias = BOT_ALIAS_SUBSTRINGS.some((a) => normalized.trim().endsWith(a));
	if (endsWithAlias) {
		return true;
	}

	if (normalized.includes(' you ') || normalized.includes(' u ') || normalized.includes(' ur ') || normalized.includes(' you\'re ') || normalized.includes(' youre ')) {
		return true;
	}

	return false;
}

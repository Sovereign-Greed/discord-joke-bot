import { TEXT_TRIGGERS } from '../constants/replies.js';

function escapeRegExp(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {string} normalized
 * @param {string} relaxed
 * @param {string} match
 * @param {string} matchRelaxed
 */
function triggerMatches(normalized, relaxed, match, matchRelaxed) {
	const hasSpace = /\s/.test(match);
	if (hasSpace) {
		return normalized.includes(match) || relaxed.includes(matchRelaxed);
	}

	const reN = new RegExp(`\\b${escapeRegExp(match)}\\b`, 'i');
	if (reN.test(normalized)) {
		return true;
	}
	if (matchRelaxed !== match) {
		const reL = new RegExp(`\\b${escapeRegExp(matchRelaxed)}\\b`, 'i');
		return reL.test(relaxed);
	}
	return false;
}

/**
 * First match wins; triggers are longest-first. Multi-word = substring (phrase);
 * single token = whole-word match to avoid `cat` in `education`.
 *
 * @param {string} normalizedMessage lowercase full message text
 * @returns {string | null}
 */
export function matchTextTriggerReply(normalizedMessage) {
	const relaxed = normalizedMessage.replace(/['’]/g, '');

	for (const { match, reply } of TEXT_TRIGGERS) {
		const matchRelaxed = match.replace(/['’]/g, '');
		if (triggerMatches(normalizedMessage, relaxed, match, matchRelaxed)) {
			return reply;
		}
	}
	return null;
}

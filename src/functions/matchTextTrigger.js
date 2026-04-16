import { TEXT_TRIGGERS } from '../constants/replies.js';

/**
 * First match wins; triggers are longest-first so specific phrases beat short substrings.
 * Apostrophes are ignored for the second pass so e.g. "it's giving" still hits `its giving`.
 *
 * @param {string} normalizedMessage lowercase full message text
 * @returns {string | null}
 */
export function matchTextTriggerReply(normalizedMessage) {
	const relaxed = normalizedMessage.replace(/['’]/g, '');

	for (const { match, reply } of TEXT_TRIGGERS) {
		const matchRelaxed = match.replace(/['’]/g, '');
		if (normalizedMessage.includes(match) || relaxed.includes(matchRelaxed)) {
			return reply;
		}
	}
	return null;
}

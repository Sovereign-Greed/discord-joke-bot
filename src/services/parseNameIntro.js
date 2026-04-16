import { NAME_INTRO_TRIGGERS } from '../constants/triggers.js';
import { MAX_INTRO_NAME_LENGTH } from '../constants/limits.js';

const TRIGGER_RE = new RegExp(
	`^(?:${NAME_INTRO_TRIGGERS.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s+(.+)$`,
	'i',
);

/**
 * Parse: "im X" / "i'm X" / "i am X" (must be at start after trim).
 *
 * @param {string} raw
 * @returns {string | null} extracted name
 */
export function parseNameIntro(raw) {
	const trimmed = raw.trim();
	const match = trimmed.match(TRIGGER_RE);
	if (!match) {
		return null;
	}

	let name = match[1]?.trim() ?? '';
	name = name.replace(/[<@#&!>]/g, '').replace(/\s+/g, ' ').trim();
	if (!name) {
		return null;
	}
	if (name.length > MAX_INTRO_NAME_LENGTH) {
		name = name.slice(0, MAX_INTRO_NAME_LENGTH).trim();
	}
	return name || null;
}

import { NAME_INTRO_TRIGGERS } from '../constants/triggers.js';

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

	const name = match[1]?.trim();
	return name || null;
}


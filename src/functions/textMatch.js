function escapeRegExp(s) {
	return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whole-word match on lowercase haystack.
 *
 * @param {string} haystackLower
 * @param {string} wordLower
 */
export function hasWholeWord(haystackLower, wordLower) {
	return new RegExp(`\\b${escapeRegExp(wordLower)}\\b`, 'i').test(haystackLower);
}

/**
 * Phrase appears as a bounded segment (handles start/end of string).
 *
 * @param {string} haystackLower
 * @param {string} phraseLower
 */
export function hasPhraseSegment(haystackLower, phraseLower) {
	const esc = escapeRegExp(phraseLower);
	return new RegExp(`(^|\\W)${esc}($|\\W)`, 'i').test(haystackLower);
}

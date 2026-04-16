/**
 * @param {'not_found' | 'network' | 'timeout'} reason
 * @param {string} query
 * @param {'spell' | 'monster'} kind
 */
export function humanizeDnd5eFailure(reason, query, kind) {
	const label = kind === 'spell' ? 'spell' : 'monster';
	if (reason === 'not_found') {
		return `No SRD ${label} matched **${query}**. Try another spelling or name (data is SRD-only).`;
	}
	if (reason === 'timeout') {
		return 'The D&D 5e API timed out. Try again in a minute.';
	}
	return 'The D&D 5e API is unreachable right now. Try again later — we cache listings to stay kind to their servers.';
}

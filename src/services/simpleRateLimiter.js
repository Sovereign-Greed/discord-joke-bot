/**
 * In-memory sliding-window rate limiter (per arbitrary string key).
 * Drops oldest timestamps outside the window; prunes empty keys to limit Map growth.
 *
 * @param {string} key
 * @param {number} maxEvents Max allowed events in the window.
 * @param {number} windowMs Window length in ms.
 * @returns {boolean} True if this call is allowed (under cap).
 */
export function allowRateLimit(key, maxEvents, windowMs) {
	const now = Date.now();
	const cutoff = now - windowMs;

	let stamps = buckets.get(key);
	if (!stamps) {
		stamps = [];
		buckets.set(key, stamps);
	}

	while (stamps.length > 0 && stamps[0] < cutoff) {
		stamps.shift();
	}

	if (stamps.length >= maxEvents) {
		return false;
	}

	stamps.push(now);
	return true;
}

/** @type {Map<string, number[]>} */
const buckets = new Map();

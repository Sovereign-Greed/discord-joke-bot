const lastRun = new Map();

/**
 * @param {string} key
 * @param {number} cooldownMs
 * @returns {{ ok: true } | { ok: false, retryAfterMs: number }}
 */
export function tryConsumeCooldown(key, cooldownMs) {
	const now = Date.now();
	const prev = lastRun.get(key) ?? 0;
	const elapsed = now - prev;
	if (elapsed < cooldownMs) {
		return { ok: false, retryAfterMs: cooldownMs - elapsed };
	}
	lastRun.set(key, now);
	return { ok: true };
}

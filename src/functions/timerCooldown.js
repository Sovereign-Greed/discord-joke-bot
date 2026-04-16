import { TIMER_USER_COOLDOWN_MS } from '../constants/limits.js';

const lastStartByGuildUser = new Map();

/**
 * @param {string} guildId
 * @param {string} userId
 * @returns {{ ok: true } | { ok: false, retryAfterMs: number }}
 */
export function tryConsumeTimerCooldown(guildId, userId) {
	const key = `${guildId}:${userId}`;
	const now = Date.now();
	const prev = lastStartByGuildUser.get(key) ?? 0;
	const elapsed = now - prev;
	if (elapsed < TIMER_USER_COOLDOWN_MS) {
		return { ok: false, retryAfterMs: TIMER_USER_COOLDOWN_MS - elapsed };
	}
	lastStartByGuildUser.set(key, now);
	return { ok: true };
}

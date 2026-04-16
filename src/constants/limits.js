/** Max characters kept from a name-intro capture (anti-spam). */
export const MAX_INTRO_NAME_LENGTH = 80;

/** Axios timeout for outbound HTTP (ms). */
export const HTTP_TIMEOUT_MS = 10_000;

/** Min time between `/timer` uses per admin per guild (anti ping-spam). */
export const TIMER_USER_COOLDOWN_MS = 60_000;

/** Min time between `/check-dnd-availability` posts per admin per guild. */
export const DND_AVAILABILITY_COOLDOWN_MS = 30_000;

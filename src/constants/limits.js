/** Max characters kept from a name-intro capture (anti-spam). */
export const MAX_INTRO_NAME_LENGTH = 80;

/** Axios timeout for outbound HTTP (ms). */
export const HTTP_TIMEOUT_MS = 10_000;

/** Min time between `/timer` uses per admin per guild (anti ping-spam). */
export const TIMER_USER_COOLDOWN_MS = 60_000;

/** Min time between `/check-dnd-availability` posts per admin per guild. */
export const DND_AVAILABILITY_COOLDOWN_MS = 30_000;

/** Per-user cooldown between `/spell` or `/monster` (anti abuse vs dnd5eapi.co). */
export const DND5E_COMMAND_COOLDOWN_MS = 8_000;

/** Cache spell/monster index lists (one request each per TTL). */
export const DND5E_INDEX_CACHE_MS = 60 * 60 * 1000;

/** Cache individual spell/monster JSON by `index`. */
export const DND5E_ENTITY_CACHE_MS = 30 * 60 * 1000;

/** Max characters of rules text shown in the embed (rest via links). */
export const DND5E_EMBED_DESC_MAX = 420;

/** Per-user slash command bursts (limits CPU under spam / viral traffic). */
export const SLASH_RATE_WINDOW_MS = 10_000;
export const SLASH_RATE_MAX_PER_USER = 18;

/** Per-user message-handler work (incoming messages we process per window). */
export const MESSAGE_HANDLER_RATE_WINDOW_MS = 10_000;
export const MESSAGE_HANDLER_RATE_MAX_PER_USER = 35;

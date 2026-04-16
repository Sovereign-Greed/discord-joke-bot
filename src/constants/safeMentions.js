/** Use on sends/replies so user-controlled text cannot ping roles/@everyone/here. */
export const MENTION_NONE = Object.freeze({
	parse: [],
	users: [],
	roles: [],
	repliedUser: false,
});

/**
 * @param {...string} userIds
 */
export function mentionOnlyUsers(...userIds) {
	return Object.freeze({
		parse: [],
		users: [...userIds],
		roles: [],
		repliedUser: false,
	});
}

/**
 * @param {...string} roleIds
 */
export function mentionOnlyRoles(...roleIds) {
	return Object.freeze({
		parse: [],
		users: [],
		roles: [...roleIds],
		repliedUser: false,
	});
}

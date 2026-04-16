import { PermissionFlagsBits } from 'discord.js';
import { ADMIN_ROLE_NAME } from '../constants/roles.js';

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export function isAdminMember(interaction) {
	const hasAdminPermission = Boolean(interaction.memberPermissions?.has(PermissionFlagsBits.Administrator));
	const hasAdminRole = Boolean(
		interaction.member?.roles?.cache?.some((r) => r.name.toLowerCase() === ADMIN_ROLE_NAME),
	);
	return hasAdminPermission || hasAdminRole;
}

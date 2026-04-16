import * as help from './help.js';
import * as listTriggers from './listTriggers.js';
import * as timer from './timer.js';
import { MENTION_NONE } from '../constants/safeMentions.js';

/** @typedef {{ data: import('discord.js').SlashCommandBuilder, execute: (interaction: import('discord.js').ChatInputCommandInteraction) => Promise<void> }} SlashCommandModule */

/** @type {SlashCommandModule[]} */
const modules = [help, listTriggers, timer];

const byName = new Map(modules.map((m) => [m.data.name, m]));

/**
 * JSON bodies for `REST.put(Routes.applicationCommands(...))`.
 */
export function getSlashCommandJson() {
	return modules.map((m) => m.data.toJSON());
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function handleChatInputCommand(interaction) {
	const command = byName.get(interaction.commandName);
	if (!command) {
		await interaction.reply({ content: 'Unknown command.', ephemeral: true, allowedMentions: MENTION_NONE });
		return;
	}
	await command.execute(interaction);
}

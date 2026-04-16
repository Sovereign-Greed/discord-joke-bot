import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { MENTION_NONE } from '../constants/safeMentions.js';

export const data = new SlashCommandBuilder()
	.setName('help')
	.setDescription('List all slash commands for Joke Bot');

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	const manager = interaction.client.application?.commands;
	if (!manager) {
		await interaction.reply({
			content: 'Bot application is not ready yet. Try `/help` again in a few seconds.',
			ephemeral: true,
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	const rows = await manager.fetch();
	const sorted = [...rows.values()].sort((a, b) => a.name.localeCompare(b.name));

	const description = sorted.length
		? sorted
			.map((cmd) => `**/${cmd.name}** — ${cmd.description || '_No description_'}`)
			.join('\n')
		: 'No slash commands are registered for this bot yet. Run **`npm run deploy-commands`** from the project (with a valid `.env`) to publish them to Discord.';

	const embed = new EmbedBuilder()
		.setTitle('Joke Bot — slash commands')
		.setColor(0x5865F2)
		.setDescription(description)
		.setFooter({ text: 'Tip: type / and pick a command from the menu.' });

	await interaction.reply({ embeds: [embed], allowedMentions: MENTION_NONE });
}

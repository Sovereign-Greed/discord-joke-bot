import { SlashCommandBuilder } from 'discord.js';
import { DND5E_COMMAND_COOLDOWN_MS } from '../constants/limits.js';
import { MENTION_NONE } from '../constants/safeMentions.js';
import { fetchSpellByQuery } from '../api/dnd5e.js';
import { buildSpellEmbed } from '../services/dnd5eEmbeds.js';
import { humanizeDnd5eFailure } from '../services/dnd5eErrors.js';
import { tryConsumeCooldown } from '../services/commandCooldown.js';

export const data = new SlashCommandBuilder()
	.setName('spell')
	.setDescription('Look up an SRD D&D 5e spell (dnd5eapi.co)')
	.addStringOption((opt) =>
		opt
			.setName('query')
			.setDescription('Spell name (e.g. fireball, magic missile)')
			.setRequired(true)
			.setMinLength(2)
			.setMaxLength(80),
	);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	const query = interaction.options.getString('query', true);
	const cooldownKey = `dnd5e-api:${interaction.user.id}`;
	const cd = tryConsumeCooldown(cooldownKey, DND5E_COMMAND_COOLDOWN_MS);
	if (!cd.ok) {
		const sec = Math.ceil(cd.retryAfterMs / 1000);
		await interaction.reply({
			content: `Slow down — another lookup in **${sec}s** (keeps the public API healthy).`,
			ephemeral: true,
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	await interaction.deferReply({ allowedMentions: MENTION_NONE });

	const result = await fetchSpellByQuery(query);
	if (!result.ok) {
		await interaction.editReply({
			content: humanizeDnd5eFailure(result.reason, query, 'spell'),
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	await interaction.editReply({
		embeds: [buildSpellEmbed(result.spell)],
		allowedMentions: MENTION_NONE,
	});
}

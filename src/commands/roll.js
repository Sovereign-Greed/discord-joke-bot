import { SlashCommandBuilder } from 'discord.js';
import { MENTION_NONE } from '../constants/safeMentions.js';
import { buildRollEmbed, DICE_DEFINITIONS } from '../services/diceRoll.js';

export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Roll a die (with modifiers, optional advantage/disadvantage for d20)')
	.addStringOption((opt) =>
		opt
			.setName('die')
			.setDescription('Which die?')
			.setRequired(true)
			.addChoices(...DICE_DEFINITIONS.map((d) => ({ name: d.name, value: d.name }))),
	)
	.addIntegerOption((opt) =>
		opt
			.setName('count')
			.setDescription('How many dice? (default: 1)')
			.setRequired(false)
			.setMinValue(1)
			.setMaxValue(10),
	)
	.addIntegerOption((opt) =>
		opt
			.setName('modifier')
			.setDescription('Modifier to add (e.g. +5 or -1)')
			.setRequired(false)
			.setMinValue(-50)
			.setMaxValue(50),
	)
	.addBooleanOption((opt) =>
		opt
			.setName('advantage')
			.setDescription('Roll with advantage (d20 only, count must be 1)')
			.setRequired(false),
	)
	.addBooleanOption((opt) =>
		opt
			.setName('disadvantage')
			.setDescription('Roll with disadvantage (d20 only, count must be 1)')
			.setRequired(false),
	);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	const dieName = interaction.options.getString('die', true);
	const count = interaction.options.getInteger('count') ?? 1;
	const modifier = interaction.options.getInteger('modifier') ?? 0;
	const advantage = Boolean(interaction.options.getBoolean('advantage'));
	const disadvantage = Boolean(interaction.options.getBoolean('disadvantage'));

	const result = buildRollEmbed({ dieName, count, modifier, advantage, disadvantage });
	if (result.type === 'error') {
		await interaction.reply({ content: result.message, ephemeral: true, allowedMentions: MENTION_NONE });
		return;
	}

	await interaction.deferReply({ allowedMentions: MENTION_NONE });
	await interaction.editReply({ embeds: [result.embed], allowedMentions: MENTION_NONE });
}

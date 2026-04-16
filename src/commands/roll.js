import { SlashCommandBuilder } from 'discord.js';
import { MENTION_NONE } from '../constants/safeMentions.js';
import { buildRollEmbed, DICE_DEFINITIONS } from '../services/diceRoll.js';

export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Roll dice (supports notation like 2d6+3; optional adv/dis)')
	.addStringOption((opt) =>
		opt
			.setName('notation')
			.setDescription('Dice notation (e.g. 2d6+3). If set, it overrides die/count/modifier.')
			.setRequired(false),
	)
	.addStringOption((opt) =>
		opt
			.setName('mode')
			.setDescription('Normal, advantage, or disadvantage')
			.setRequired(false)
			.addChoices(
				{ name: 'normal', value: 'normal' },
				{ name: 'advantage', value: 'advantage' },
				{ name: 'disadvantage', value: 'disadvantage' },
			),
	)
	.addStringOption((opt) =>
		opt
			.setName('die')
			.setDescription('Which die?')
			.setRequired(false)
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
	);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	const notation = interaction.options.getString('notation') ?? '';
	const mode = interaction.options.getString('mode') ?? 'normal';
	const dieName = interaction.options.getString('die') ?? 'd20';
	const count = interaction.options.getInteger('count') ?? 1;
	const modifier = interaction.options.getInteger('modifier') ?? 0;

	const result = buildRollEmbed({ notation, mode, dieName, count, modifier });
	if (result.type === 'error') {
		await interaction.reply({ content: result.message, ephemeral: true, allowedMentions: MENTION_NONE });
		return;
	}

	await interaction.deferReply({ allowedMentions: MENTION_NONE });
	await interaction.editReply({
		embeds: [result.embed],
		files: result.files ?? [],
		allowedMentions: MENTION_NONE,
	});
}

import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { MENTION_NONE } from '../constants/safeMentions.js';

const DICE = Object.freeze([
	{ name: 'd4', sides: 4 },
	{ name: 'd6', sides: 6 },
	{ name: 'd8', sides: 8 },
	{ name: 'd10', sides: 10 },
	{ name: 'd12', sides: 12 },
	{ name: 'd20', sides: 20 },
	{ name: 'd100', sides: 100 },
]);

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickVibe({ sides, raw }) {
	// Intuitive feel: for d20 use common DC bands; otherwise use % of max.
	if (sides === 20) {
		if (raw >= 15) return { label: 'Good', color: 0x57F287 };
		if (raw <= 6) return { label: 'Bad', color: 0xED4245 };
		return { label: 'Neutral', color: 0xFEE75C };
	}

	const pct = raw / sides;
	if (pct >= 0.75) return { label: 'Good', color: 0x57F287 };
	if (pct <= 0.35) return { label: 'Bad', color: 0xED4245 };
	return { label: 'Neutral', color: 0xFEE75C };
}

export const data = new SlashCommandBuilder()
	.setName('roll')
	.setDescription('Roll a die (with modifiers, optional advantage/disadvantage for d20)')
	.addStringOption((opt) =>
		opt
			.setName('die')
			.setDescription('Which die?')
			.setRequired(true)
			.addChoices(...DICE.map((d) => ({ name: d.name, value: d.name }))),
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

	const die = DICE.find((d) => d.name === dieName);
	if (!die) {
		await interaction.reply({ content: 'Unknown die.', ephemeral: true, allowedMentions: MENTION_NONE });
		return;
	}

	if (advantage && disadvantage) {
		await interaction.reply({ content: 'Pick either advantage or disadvantage (not both).', ephemeral: true, allowedMentions: MENTION_NONE });
		return;
	}

	if ((advantage || disadvantage) && (die.sides !== 20 || count !== 1)) {
		await interaction.reply({
			content: 'Advantage/disadvantage is only supported for **1d20** (set `die=d20` and leave `count` as 1).',
			ephemeral: true,
			allowedMentions: MENTION_NONE,
		});
		return;
	}

	await interaction.deferReply({ allowedMentions: MENTION_NONE });

	let raw;
	let rollDetail = '';

	if (die.sides === 20 && (advantage || disadvantage)) {
		const a = randInt(1, 20);
		const b = randInt(1, 20);
		raw = advantage ? Math.max(a, b) : Math.min(a, b);
		const tag = advantage ? 'adv' : 'dis';
		rollDetail = `(${tag}: ${a}, ${b} → **${raw}**)`;
	}
	else {
		const rolls = Array.from({ length: count }, () => randInt(1, die.sides));
		raw = rolls.reduce((s, x) => s + x, 0);
		rollDetail = count === 1 ? `(**${rolls[0]}**)` : `(${rolls.join(', ')})`;
	}

	const total = raw + modifier;
	const modText = modifier === 0 ? '' : modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
	const formula = `${count}d${die.sides}${modText}`;

	const { label: vibeLabel, color } = pickVibe({ sides: die.sides, raw: die.sides === 20 && (advantage || disadvantage) ? raw : (count === 1 ? raw : Math.round(raw / count)) });

	const isNat20 = die.sides === 20 && count === 1 && raw === 20;
	const isNat1 = die.sides === 20 && count === 1 && raw === 1;

	let headline = `🎲 ${formula} → **${total}**`;
	let signifier = '';
	if (isNat20) {
		signifier = '✨ **NAT 20!** ✨';
		headline = `🎲 ${formula} → **${total}**  🎉`;
	}
	else if (isNat1) {
		signifier = '💀 **NAT 1...** 💀';
		headline = `🎲 ${formula} → **${total}**  🥀`;
	}

	const embed = new EmbedBuilder()
		.setTitle(signifier || `Result: ${vibeLabel}`)
		.setColor(color)
		.setDescription(`${headline}\n${rollDetail}`)
		.setFooter({ text: isNat20 || isNat1 ? 'Legendary moment.' : `Vibe: ${vibeLabel}` });

	await interaction.editReply({ embeds: [embed], allowedMentions: MENTION_NONE });
}


import { EmbedBuilder } from 'discord.js';

export const DICE_DEFINITIONS = Object.freeze([
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

/**
 * @param {{
 *   dieName: string,
 *   count: number,
 *   modifier: number,
 *   advantage: boolean,
 *   disadvantage: boolean,
 * }} input
 * @returns {{ type: 'error', message: string } | { type: 'ok', embed: import('discord.js').EmbedBuilder }}
 */
export function buildRollEmbed(input) {
	const { dieName, count, modifier, advantage, disadvantage } = input;

	const die = DICE_DEFINITIONS.find((d) => d.name === dieName);
	if (!die) {
		return { type: 'error', message: 'Unknown die.' };
	}

	if (advantage && disadvantage) {
		return { type: 'error', message: 'Pick either advantage or disadvantage (not both).' };
	}

	if ((advantage || disadvantage) && (die.sides !== 20 || count !== 1)) {
		return {
			type: 'error',
			message: 'Advantage/disadvantage is only supported for **1d20** (set `die=d20` and leave `count` as 1).',
		};
	}

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

	const vibeRaw = die.sides === 20 && (advantage || disadvantage) ? raw : (count === 1 ? raw : Math.round(raw / count));
	const { label: vibeLabel, color } = pickVibe({ sides: die.sides, raw: vibeRaw });

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

	return { type: 'ok', embed };
}

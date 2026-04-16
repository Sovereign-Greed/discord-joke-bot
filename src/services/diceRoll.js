import { EmbedBuilder } from 'discord.js';
import { getBadRollerName } from '../env.js';

export const DICE_DEFINITIONS = Object.freeze([
	{ name: 'd4', sides: 4 },
	{ name: 'd6', sides: 6 },
	{ name: 'd8', sides: 8 },
	{ name: 'd10', sides: 10 },
	{ name: 'd12', sides: 12 },
	{ name: 'd20', sides: 20 },
	{ name: 'd100', sides: 100 },
]);

/** @type {readonly string[]} */
const MOOD_GOOD = Object.freeze(['🔥', '🌟', '✨', '💪', '🎯', '⚡', '🏆', '💯']);
/** @type {readonly string[]} */
const MOOD_BAD = Object.freeze(['🥀', '💀', '🦴', '😬', '🎲', '🔻', '🌧️', '🫠']);
/** @type {readonly string[]} */
const MOOD_NEUTRAL = Object.freeze(['🎲', '😐', '📊', '⚖️', '🧊', '〰️', '📝']);

/** Use `{name}` — replaced with `BAD_ROLLER_NAME` from `.env` when nat 1 flavor runs. */
const NAT1_FRIEND_LINES = Object.freeze([
	'Way to roll like {name}.',
	'{name} energy. The dice remember.',
	'That\'s a certified {name} roll.',
	'{name} would feel seen right now.',
	'The table says: "{name} sends their regards."',
	'Almost as rough as {name}\'s luck—almost.',
	'{name}\'s dice are cheering. They found their champion.',
]);

/**
 * @param {string} name
 * @param {readonly string[]} pool
 */
function pickNat1FriendLine(name, pool) {
	const line = pickRandom(pool);
	return line.replaceAll('{name}', name);
}

/** @type {readonly string[]} */
const FLAVOR_GOOD = Object.freeze([
	'Chef\'s kiss.',
	'Not bad. Not bad at all.',
	'The math is mathing.',
	'Okay, show-off.',
]);

/** @type {readonly string[]} */
const FLAVOR_BAD = Object.freeze([
	'The dice are in a mood.',
	'Physics called. It\'s disappointed.',
	'That\'s a story beat.',
	'Could be worse. Probably.',
]);

/** @type {readonly string[]} */
const FLAVOR_NEUTRAL = Object.freeze([
	'Mid. Solid mid.',
	'Living in the middle.',
	'Average enjoyer.',
]);

/** @type {readonly string[]} */
const NAT20_LINES = Object.freeze([
	'Main character moment.',
	'The table just gasped.',
	'That\'s cinema.',
]);

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * @param {readonly string[]} pool
 */
function pickRandom(pool) {
	return pool[randInt(0, pool.length - 1)];
}

/**
 * @param {readonly string[]} pool
 */
function pickTwoEmojis(pool) {
	const a = pickRandom(pool);
	let b = pickRandom(pool);
	let guard = 0;
	while (b === a && pool.length > 1 && guard < 8) {
		b = pickRandom(pool);
		guard += 1;
	}
	return `${a} ${b}`;
}

/**
 * @returns {{ category: 'good' | 'bad' | 'neutral', color: number }}
 */
function classifyMood({ sides, raw }) {
	if (sides === 20) {
		if (raw >= 15) return { category: 'good', color: 0x57F287 };
		if (raw <= 6) return { category: 'bad', color: 0xED4245 };
		return { category: 'neutral', color: 0xFEE75C };
	}

	const pct = raw / sides;
	if (pct >= 0.75) return { category: 'good', color: 0x57F287 };
	if (pct <= 0.35) return { category: 'bad', color: 0xED4245 };
	return { category: 'neutral', color: 0xFEE75C };
}

function moodPool(category) {
	if (category === 'good') {
		return MOOD_GOOD;
	}
	if (category === 'bad') {
		return MOOD_BAD;
	}
	return MOOD_NEUTRAL;
}

/** ~25% chance for a generic bonus line (not on nat 1/20 special handling). */
const FLAVOR_CHANCE = 0.25;

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
	const { category, color } = classifyMood({ sides: die.sides, raw: vibeRaw });
	const emojis = pickTwoEmojis(moodPool(category));

	const isNat20 = die.sides === 20 && count === 1 && raw === 20;
	const isNat1 = die.sides === 20 && count === 1 && raw === 1;
	const badRollerName = getBadRollerName();

	const headline = `🎲 ${formula} → **${total}**\n${rollDetail}`;

	const extraLines = [];

	if (isNat20) {
		extraLines.push(`${pickTwoEmojis(MOOD_GOOD)} **NAT 20!**`);
		extraLines.push(`*${pickRandom(NAT20_LINES)}*`);
	}
	else if (isNat1 && badRollerName) {
		extraLines.push(`${pickTwoEmojis(MOOD_BAD)} **NAT 1**`);
		extraLines.push(`*${pickNat1FriendLine(badRollerName, NAT1_FRIEND_LINES)}*`);
	}
	else if (Math.random() < FLAVOR_CHANCE) {
		const pool = category === 'good' ? FLAVOR_GOOD : category === 'bad' ? FLAVOR_BAD : FLAVOR_NEUTRAL;
		extraLines.push(`*${pickRandom(pool)}*`);
	}

	const description = [emojis, headline, ...extraLines].filter(Boolean).join('\n\n');

	const embed = new EmbedBuilder()
		.setTitle(`Result: ${total}`)
		.setColor(color)
		.setDescription(description);

	return { type: 'ok', embed };
}

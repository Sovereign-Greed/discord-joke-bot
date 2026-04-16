import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import { getBadRollerName } from '../env.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..', '..');

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Parse dice notation like `2d6+3`, `d20-1`, `4d8`.
 * @param {string} s
 * @returns {{ ok: true, dieName: string, count: number, modifier: number } | { ok: false, message: string }}
 */
function parseNotation(s) {
	const raw = String(s ?? '').trim();
	if (!raw) return { ok: false, message: 'Notation is empty.' };

	const cleaned = raw.replace(/\s+/g, '');
	const m = /^(\d*)d(\d+)([+-]\d+)?$/i.exec(cleaned);
	if (!m) {
		return { ok: false, message: 'Invalid notation. Try `2d6+3`, `d20-1`, or `4d8`.' };
	}

	const count = m[1] ? Number(m[1]) : 1;
	const sides = Number(m[2]);
	const modifier = m[3] ? Number(m[3]) : 0;

	if (!Number.isFinite(count) || count < 1) return { ok: false, message: 'Dice count must be at least 1.' };
	if (count > 10) return { ok: false, message: 'Dice count max is 10.' };
	if (!Number.isFinite(sides) || sides < 2) return { ok: false, message: 'Die sides must be at least 2.' };
	if (!Number.isFinite(modifier) || modifier < -50 || modifier > 50) return { ok: false, message: 'Modifier must be between -50 and 50.' };

	const dieName = `d${sides}`;
	const die = DICE_DEFINITIONS.find((d) => d.name === dieName);
	if (!die) {
		return { ok: false, message: `Unsupported die: ${dieName}. Try one of: ${DICE_DEFINITIONS.map((d) => d.name).join(', ')}.` };
	}

	return { ok: true, dieName, count, modifier };
}

/**
 * Optional roll asset: `assets/roll.png` (user-provided).
 * If present, attach and use it as embed thumbnail.
 * @returns {{ files: import('discord.js').AttachmentBuilder[], thumbnailUrl: string } | null}
 */
function getRollAsset() {
	const rollPng = path.join(projectRoot, 'assets', 'roll.png');
	if (!fs.existsSync(rollPng)) return null;
	const attachment = new AttachmentBuilder(rollPng, { name: 'roll.png' });
	return { files: [attachment], thumbnailUrl: 'attachment://roll.png' };
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
 *   notation?: string,
 *   mode?: 'normal' | 'advantage' | 'disadvantage',
 *   dieName?: string,
 *   count?: number,
 *   modifier?: number,
 * }} input
 * @returns {{ type: 'error', message: string } | { type: 'ok', embed: import('discord.js').EmbedBuilder, files?: import('discord.js').AttachmentBuilder[] }}
 */
export function buildRollEmbed(input) {
	const mode = input.mode ?? 'normal';
	const hasNotation = Boolean(input.notation?.trim());

	let dieName = input.dieName ?? 'd20';
	let count = input.count ?? 1;
	let modifier = input.modifier ?? 0;

	if (hasNotation) {
		const parsed = parseNotation(input.notation ?? '');
		if (!parsed.ok) return { type: 'error', message: parsed.message };
		dieName = parsed.dieName;
		count = parsed.count;
		modifier = parsed.modifier;
	}

	const die = DICE_DEFINITIONS.find((d) => d.name === dieName);
	if (!die) {
		return { type: 'error', message: 'Unknown die.' };
	}

	const advantage = mode === 'advantage';
	const disadvantage = mode === 'disadvantage';

	/**
	 * @param {number} n
	 * @param {number} sides
	 */
	function rollPool(n, sides) {
		const rolls = Array.from({ length: n }, () => randInt(1, sides));
		const sum = rolls.reduce((s, x) => s + x, 0);
		return { rolls, sum };
	}

	let rollDetail = '';
	/** @type {{ rolls: number[], sum: number }} */
	let chosen;
	/** @type {{ rolls: number[], sum: number } | null} */
	let alt = null;

	if (advantage || disadvantage) {
		const r1 = rollPool(count, die.sides);
		const r2 = rollPool(count, die.sides);
		chosen = advantage ? (r1.sum >= r2.sum ? r1 : r2) : (r1.sum <= r2.sum ? r1 : r2);
		alt = chosen === r1 ? r2 : r1;
		const tag = advantage ? 'adv' : 'dis';
		if (count === 1) {
			const a = r1.rolls[0];
			const b = r2.rolls[0];
			rollDetail = `(${tag}: ${a}, ${b} → **${chosen.sum}**)`;
		}
		else {
			/** @param {{ rolls: number[], sum: number }} r */
			const fmt = (r) => `${r.rolls.join(', ')} = ${r.sum}`;
			rollDetail = `(${tag}: ${fmt(r1)} vs ${fmt(r2)} → **${chosen.sum}**)`;
		}
	}
	else {
		chosen = rollPool(count, die.sides);
		rollDetail = count === 1 ? `(**${chosen.rolls[0]}**)` : `(${chosen.rolls.join(', ')})`;
	}

	const raw = chosen.sum;
	const total = chosen.sum + modifier;
	const modText = modifier === 0 ? '' : modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
	const formula = `${count}d${die.sides}${modText}`;

	/** Average die (or single face) for mood bands on multi-dice pools. */
	const vibeRaw = count === 1 ? chosen.sum : Math.round(chosen.sum / count);
	const { category, color } = classifyMood({ sides: die.sides, raw: vibeRaw });
	const emojis = pickTwoEmojis(moodPool(category));

	const isNat20 = die.sides === 20 && count === 1 && chosen.sum === 20;
	const isNat1 = die.sides === 20 && count === 1 && chosen.sum === 1;
	const badRollerName = getBadRollerName();

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

	const embed = new EmbedBuilder().setTitle(`Result: ${total}`).setColor(color);

	const modeLabel = advantage ? 'Advantage' : disadvantage ? 'Disadvantage' : 'Normal';
	const modLabel = modifier === 0 ? '0' : modifier > 0 ? `+${modifier}` : `${modifier}`;

	embed.addFields(
		{ name: 'Roll', value: `${emojis} **${modeLabel}**`, inline: true },
		{ name: 'Formula', value: `\`${formula}\``, inline: true },
		{ name: 'Total', value: `**${total}**`, inline: true },
		{ name: 'Raw', value: `**${raw}**`, inline: true },
		{ name: 'Modifier', value: `\`${modLabel}\``, inline: true },
		{ name: 'Die', value: `\`${die.name}\``, inline: true },
	);

	if (advantage || disadvantage) {
		/** @param {{ rolls: number[], sum: number }} r */
		const fmt = (r) => (r.rolls.length === 1 ? `${r.rolls[0]}` : `${r.rolls.join(', ')} = ${r.sum}`);
		embed.addFields({
			name: advantage ? 'Advantage roll-off' : 'Disadvantage roll-off',
			value: `A: \`${fmt(chosen)}\`\nB: \`${alt ? fmt(alt) : '—'}\`\nChosen raw: **${chosen.sum}**`,
			inline: false,
		});
	}
	else {
		const breakdown = chosen.rolls.length === 1 ? `\`${chosen.rolls[0]}\`` : `\`${chosen.rolls.join(', ')}\``;
		embed.addFields({ name: 'Breakdown', value: `${breakdown}`, inline: false });
	}

	if (rollDetail) {
		embed.addFields({ name: 'Detail', value: rollDetail, inline: false });
	}
	if (extraLines.length) {
		embed.addFields({ name: 'Extra', value: extraLines.join('\n'), inline: false });
	}

	const asset = getRollAsset();
	if (asset) {
		embed.setThumbnail(asset.thumbnailUrl);
		return { type: 'ok', embed, files: asset.files };
	}

	return { type: 'ok', embed };
}

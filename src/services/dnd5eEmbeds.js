import { EmbedBuilder } from 'discord.js';
import { DND5E_EMBED_DESC_MAX } from '../constants/limits.js';
import { DND5E_ORIGIN } from '../constants/endpoints.js';

/**
 * @param {string} text
 * @param {number} max
 */
function truncate(text, max) {
	if (!text || text.length <= max) {
		return text || '';
	}
	return `${text.slice(0, max - 1)}…`;
}

/**
 * @param {string[]} parts
 */
function joinDesc(parts) {
	if (!Array.isArray(parts)) {
		return '';
	}
	return parts.join('\n\n');
}

/**
 * @param {object} spell
 */
export function buildSpellEmbed(spell) {
	const descFull = joinDesc(spell.desc);
	const desc = truncate(descFull, DND5E_EMBED_DESC_MAX);

	const schoolName = spell.school?.name ?? '—';
	const classes = Array.isArray(spell.classes) ? spell.classes.map((c) => c.name).join(', ') : '—';
	const comps = Array.isArray(spell.components) ? spell.components.join(', ') : '—';
	const material = spell.material ? truncate(`Material: ${spell.material}`, 120) : null;

	const apiPath = typeof spell.url === 'string' ? spell.url : `/api/spells/${spell.index}`;
	const apiJsonUrl = `${DND5E_ORIGIN}${apiPath}`;
	const roll20Url = `https://roll20.net/compendium/dnd5e/Spells%3A${encodeURIComponent(spell.name)}`;

	const embed = new EmbedBuilder()
		.setTitle(spell.name ?? 'Spell')
		.setColor(0x5865F2)
		.setDescription(desc || '_No description in SRD._')
		.addFields(
			{ name: 'Level', value: String(spell.level ?? '—'), inline: true },
			{ name: 'School', value: schoolName, inline: true },
			{ name: 'Casting time', value: `${spell.casting_time ?? '—'}${spell.ritual ? ' (ritual)' : ''}`, inline: true },
			{ name: 'Range', value: spell.range ?? '—', inline: true },
			{ name: 'Duration', value: `${spell.duration ?? '—'}${spell.concentration ? ' (concentration)' : ''}`, inline: true },
			{ name: 'Components', value: truncate(material ? `${comps}\n${material}` : comps, 900), inline: false },
			{ name: 'Classes (SRD)', value: truncate(classes, 200), inline: false },
			{
				name: 'Links',
				value: `[Roll20 compendium](${roll20Url}) · [API JSON (source)](${apiJsonUrl})`,
				inline: false,
			},
		)
		.setFooter({
			text: 'SRD data via dnd5eapi.co — respect rate limits; full rules in PHB/SRD',
		});

	return embed;
}

/**
 * @param {unknown} ac
 */
function formatArmorClass(ac) {
	if (ac == null) {
		return '—';
	}
	if (typeof ac === 'number') {
		return String(ac);
	}
	if (Array.isArray(ac)) {
		const first = ac[0];
		if (first && typeof first === 'object' && typeof first.value === 'number') {
			return String(first.value);
		}
		return truncate(JSON.stringify(ac), 80);
	}
	return String(ac);
}

/**
 * @param {Record<string, string>} speed
 */
function formatSpeed(speed) {
	if (!speed || typeof speed !== 'object') {
		return '—';
	}
	return Object.entries(speed)
		.map(([k, v]) => `${k} ${v}`)
		.join(', ');
}

/**
 * @param {unknown} senses
 */
function formatSenses(senses) {
	if (!senses || typeof senses !== 'object') {
		return String(senses ?? '—');
	}
	return Object.entries(senses)
		.map(([k, v]) => `${k}: ${v}`)
		.join('; ');
}

/**
 * @param {object} monster
 */
export function buildMonsterEmbed(monster) {
	const firstBlock =
		Array.isArray(monster.special_abilities) && monster.special_abilities[0]
			? monster.special_abilities[0]
			: Array.isArray(monster.actions) && monster.actions[0]
				? monster.actions[0]
				: null;
	const firstAction = firstBlock
		? `**${firstBlock.name}** — ${truncate(firstBlock.desc ?? '', 340)}`
		: '—';

	const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma']
		.map((k) => {
			const v = monster[k];
			if (typeof v !== 'number') {
				return null;
			}
			const mod = Math.floor((v - 10) / 2);
			const sign = mod >= 0 ? '+' : '';
			return `${k.slice(0, 3).toUpperCase()} ${v} (${sign}${mod})`;
		})
		.filter(Boolean)
		.join(' · ');

	const apiPath = typeof monster.url === 'string' ? monster.url : `/api/monsters/${monster.index}`;
	const apiJsonUrl = `${DND5E_ORIGIN}${apiPath}`;
	const roll20Url = `https://roll20.net/compendium/dnd5e/Monsters%3A${encodeURIComponent(monster.name)}`;

	const typeLine = [monster.size, monster.type, monster.subtype, monster.alignment].filter(Boolean).join(' ');

	return new EmbedBuilder()
		.setTitle(monster.name ?? 'Monster')
		.setColor(0xE67E22)
		.setDescription(truncate(typeLine, 240) || '—')
		.addFields(
			{ name: 'AC', value: formatArmorClass(monster.armor_class), inline: true },
			{
				name: 'HP',
				value: monster.hit_points != null ? `${monster.hit_points}${monster.hit_dice ? ` (${monster.hit_dice})` : ''}` : '—',
				inline: true,
			},
			{ name: 'CR', value: monster.challenge_rating != null ? String(monster.challenge_rating) : '—', inline: true },
			{ name: 'Speed', value: truncate(formatSpeed(monster.speed), 200), inline: false },
			{ name: 'Ability scores', value: truncate(stats, 900), inline: false },
			{ name: 'Senses / languages', value: truncate(`${formatSenses(monster.senses)} · ${monster.languages ?? '—'}`, 400), inline: false },
			{ name: 'First trait or action', value: truncate(firstAction, 900), inline: false },
			{
				name: 'Links',
				value: `[Roll20 compendium](${roll20Url}) · [API JSON (source)](${apiJsonUrl})`,
				inline: false,
			},
		)
		.setFooter({
			text: 'SRD data via dnd5eapi.co — stat block truncated; use links for full text',
		});
}

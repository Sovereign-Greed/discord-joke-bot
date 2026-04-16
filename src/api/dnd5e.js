import axios from 'axios';
import { DND5E_API_BASE } from '../constants/endpoints.js';
import {
	DND5E_ENTITY_CACHE_MS,
	DND5E_INDEX_CACHE_MS,
} from '../constants/limits.js';
import { http } from './http.js';

/** @typedef {{ index: string, name: string, url: string }} Dnd5eIndexItem */

/** @type {{ results: Dnd5eIndexItem[], expires: number } | null} */
let spellsIndexCache = null;
/** @type {{ results: Dnd5eIndexItem[], expires: number } | null} */
let monstersIndexCache = null;

/** @type {Map<string, { data: unknown, expires: number }>} */
const spellDetailCache = new Map();
/** @type {Map<string, { data: unknown, expires: number }>} */
const monsterDetailCache = new Map();

async function getSpellsIndex() {
	const now = Date.now();
	if (spellsIndexCache && now < spellsIndexCache.expires) {
		return spellsIndexCache.results;
	}
	const { data } = await http.get(`${DND5E_API_BASE}/spells`);
	const results = data.results ?? [];
	spellsIndexCache = { results, expires: now + DND5E_INDEX_CACHE_MS };
	return results;
}

async function getMonstersIndex() {
	const now = Date.now();
	if (monstersIndexCache && now < monstersIndexCache.expires) {
		return monstersIndexCache.results;
	}
	const { data } = await http.get(`${DND5E_API_BASE}/monsters`);
	const results = data.results ?? [];
	monstersIndexCache = { results, expires: now + DND5E_INDEX_CACHE_MS };
	return results;
}

/**
 * @param {string} query
 * @param {Dnd5eIndexItem[]} results
 * @returns {Dnd5eIndexItem | null}
 */
export function findBestIndexMatch(query, results) {
	const q = query.trim().toLowerCase();
	if (q.length < 2) {
		return null;
	}
	const qSlug = q.replace(/\s+/g, '-');

	const byIndex = results.find((r) => r.index === qSlug);
	if (byIndex) {
		return byIndex;
	}

	const byExactName = results.find((r) => r.name.toLowerCase() === q);
	if (byExactName) {
		return byExactName;
	}

	const starts = results.filter((r) => r.name.toLowerCase().startsWith(q));
	if (starts.length === 1) {
		return starts[0];
	}

	const includes = results.filter((r) => r.name.toLowerCase().includes(q));
	if (includes.length === 0) {
		return null;
	}
	if (includes.length === 1) {
		return includes[0];
	}
	return [...includes].sort((a, b) => a.name.length - b.name.length)[0];
}

/**
 * @param {string} index
 */
async function getSpellByIndex(index) {
	const now = Date.now();
	const hit = spellDetailCache.get(index);
	if (hit && now < hit.expires) {
		return hit.data;
	}
	try {
		const { data } = await http.get(`${DND5E_API_BASE}/spells/${index}`);
		spellDetailCache.set(index, { data, expires: now + DND5E_ENTITY_CACHE_MS });
		return data;
	}
	catch (e) {
		if (axios.isAxiosError(e) && e.response?.status === 404) {
			return null;
		}
		throw e;
	}
}

/**
 * @param {string} index
 */
async function getMonsterByIndex(index) {
	const now = Date.now();
	const hit = monsterDetailCache.get(index);
	if (hit && now < hit.expires) {
		return hit.data;
	}
	try {
		const { data } = await http.get(`${DND5E_API_BASE}/monsters/${index}`);
		monsterDetailCache.set(index, { data, expires: now + DND5E_ENTITY_CACHE_MS });
		return data;
	}
	catch (e) {
		if (axios.isAxiosError(e) && e.response?.status === 404) {
			return null;
		}
		throw e;
	}
}

function classifyAxiosError(err) {
	if (!axios.isAxiosError(err)) {
		return 'network';
	}
	if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
		return 'timeout';
	}
	if (!err.response) {
		return 'network';
	}
	return 'network';
}

/**
 * @param {string} query
 * @returns {Promise<{ ok: true, spell: object } | { ok: false, reason: 'not_found' | 'network' | 'timeout' }>}
 */
export async function fetchSpellByQuery(query) {
	try {
		const list = await getSpellsIndex();
		const match = findBestIndexMatch(query, list);
		if (!match) {
			return { ok: false, reason: 'not_found' };
		}
		const spell = await getSpellByIndex(match.index);
		if (!spell) {
			return { ok: false, reason: 'not_found' };
		}
		return { ok: true, spell };
	}
	catch (err) {
		const kind = classifyAxiosError(err);
		return { ok: false, reason: kind === 'timeout' ? 'timeout' : 'network' };
	}
}

/**
 * @param {string} query
 * @returns {Promise<{ ok: true, monster: object } | { ok: false, reason: 'not_found' | 'network' | 'timeout' }>}
 */
export async function fetchMonsterByQuery(query) {
	try {
		const list = await getMonstersIndex();
		const match = findBestIndexMatch(query, list);
		if (!match) {
			return { ok: false, reason: 'not_found' };
		}
		const monster = await getMonsterByIndex(match.index);
		if (!monster) {
			return { ok: false, reason: 'not_found' };
		}
		return { ok: true, monster };
	}
	catch (err) {
		const kind = classifyAxiosError(err);
		return { ok: false, reason: kind === 'timeout' ? 'timeout' : 'network' };
	}
}

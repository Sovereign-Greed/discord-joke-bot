import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// Load .env from project root (works when cwd is repo root or elsewhere)
config({ path: path.join(projectRoot, '.env') });

const SNOWFLAKE_RE = /^\d{17,20}$/;
const PUBLIC_KEY_HEX_RE = /^[0-9a-fA-F]{64}$/;

/**
 * @returns {{ ok: boolean, missing: string[], errors: string[], values: { botToken: string, applicationId: string, publicKey: string } | null }}
 */
export function validateEnv() {
	const botToken = process.env.BOT_TOKEN?.trim();
	const applicationId = process.env.APPLICATION_ID?.trim();
	const publicKey = process.env.PUBLIC_KEY?.trim();

	const missing = [];
	if (!botToken) missing.push('BOT_TOKEN');
	if (!applicationId) missing.push('APPLICATION_ID');
	if (!publicKey) missing.push('PUBLIC_KEY');

	const errors = [];
	if (applicationId && !SNOWFLAKE_RE.test(applicationId)) {
		errors.push('APPLICATION_ID must be a numeric snowflake (17–20 digits), from the Discord Developer Portal → General Information.');
	}
	if (publicKey && !PUBLIC_KEY_HEX_RE.test(publicKey)) {
		errors.push('PUBLIC_KEY must be a 64-character hex string, from the Developer Portal → General Information (used for interactions verification).');
	}

	const ok = missing.length === 0 && errors.length === 0;
	const values =
		ok && botToken && applicationId && publicKey
			? { botToken, applicationId, publicKey }
			: null;

	return { ok, missing, errors, values };
}

export function getEnv() {
	const result = validateEnv();
	if (!result.ok || !result.values) {
		const lines = [];
		if (result.missing.length) {
			lines.push(`Missing environment variables: ${result.missing.join(', ')}`);
		}
		result.errors.forEach((e) => lines.push(e));
		throw new Error(lines.join('\n'));
	}
	return result.values;
}

export function printEnvStatus() {
	const { ok, missing, errors, values } = validateEnv();

	if (values) {
		console.log('Environment check passed.');
		console.log(`  APPLICATION_ID: ${values.applicationId.slice(0, 4)}…${values.applicationId.slice(-4)} (${values.applicationId.length} digits)`);
		console.log(`  PUBLIC_KEY:     ${values.publicKey.slice(0, 8)}… (${values.publicKey.length} hex chars)`);
		console.log(`  BOT_TOKEN:      set (${values.botToken.length} chars)`);
	}
	else {
		console.error('Environment check failed.');
		if (missing.length) {
			console.error(`  Missing: ${missing.join(', ')}`);
		}
		errors.forEach((e) => console.error(`  ${e}`));
	}

	return ok;
}

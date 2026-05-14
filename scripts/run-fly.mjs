/**
 * npm on Windows runs scripts via cmd.exe, which often does not inherit Git Bash PATH.
 * Resolve a Windows PE binary under ~/.fly/bin (fly.exe / flyctl.exe), not the Git-Bash-only `fly` shim.
 *
 * Override: set FLY_BINARY to a full path to fly.exe / flyctl.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

/** @returns {string | null} */
function resolveFlyFromDotFlyBin() {
	const bin = path.join(os.homedir(), '.fly', 'bin');
	if (!existsSync(bin)) {
		return null;
	}
	const prefer = ['fly.exe', 'flyctl.exe', 'fly.cmd'];
	let names;
	try {
		names = readdirSync(bin);
	}
	catch {
		return null;
	}
	const lower = new Map(names.map((n) => [n.toLowerCase(), n]));
	for (const p of prefer) {
		const actual = lower.get(p.toLowerCase());
		if (actual) {
			return path.join(bin, actual);
		}
	}
	return null;
}

function resolveFlyBinary() {
	const override = process.env.FLY_BINARY;
	if (override && existsSync(override)) {
		return override;
	}
	if (process.platform === 'win32') {
		const fromBin = resolveFlyFromDotFlyBin();
		if (fromBin) {
			return fromBin;
		}
	}
	return 'fly';
}

const fly = resolveFlyBinary();
const argv = process.argv.slice(2);
if (argv.length === 0) {
	console.error('Usage: node scripts/run-fly.mjs <fly args…>\nExample: node scripts/run-fly.mjs machine list --app discord-joke-bot');
	process.exit(1);
}

const result = spawnSync(fly, argv, { stdio: 'inherit' });
if (result.error) {
	console.error(result.error.message);
	const bin = path.join(os.homedir(), '.fly', 'bin');
	if (process.platform === 'win32' && existsSync(bin)) {
		console.error(
			`Found ${bin} but Node could not run "${fly}". ` +
				'Git Bash often has a shell script named fly there while Windows needs fly.exe. ' +
				'Reinstall or repair: https://fly.io/docs/hands-on/install-flyctl/ — or set FLY_BINARY to the full path of fly.exe.',
		);
	}
	else {
		console.error('Install Fly: https://fly.io/docs/hands-on/install-flyctl/');
		console.error('Or set FLY_BINARY to the full path of your fly executable.');
	}
	process.exit(1);
}
process.exit(result.status === null ? 1 : result.status);

/**
 * npm on Windows runs scripts via cmd.exe, which often does not inherit Git Bash PATH.
 * Resolve the Fly CLI binary (default install: ~/.fly/bin/fly.exe) and exec it.
 *
 * Override: set FLY_BINARY to a full path to fly.exe / fly.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

function resolveFlyBinary() {
	const override = process.env.FLY_BINARY;
	if (override && existsSync(override)) {
		return override;
	}
	if (process.platform === 'win32') {
		const exe = path.join(os.homedir(), '.fly', 'bin', 'fly.exe');
		if (existsSync(exe)) {
			return exe;
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
	console.error('Install Fly: https://fly.io/docs/hands-on/install-flyctl/');
	console.error('Or set FLY_BINARY to the full path of your fly executable.');
	process.exit(1);
}
process.exit(result.status === null ? 1 : result.status);

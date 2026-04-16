import { REST, Routes } from 'discord.js';
import { getEnv } from '../src/env.js';
import { getSlashCommandJson } from '../src/commands/index.js';

const { botToken, applicationId } = getEnv();
const rest = new REST({ version: '10' }).setToken(botToken);

const body = getSlashCommandJson();

try {
	await rest.put(Routes.applicationCommands(applicationId), { body });
	console.log(`Registered ${body.length} global application (/) command(s).`);
	console.log('Global commands can take up to ~1 hour to appear everywhere; they show instantly in DMs with the bot.');
}
catch (err) {
	console.error('Failed to register application commands:', err);
	process.exitCode = 1;
}

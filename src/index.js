import { Client, GatewayIntentBits } from 'discord.js';
import { getEnv } from './env.js';
import ready from './events/ready.js';
import messageCreate from './events/messageCreate.js';
import interactionCreate from './events/interactionCreate.js';

const { botToken } = getEnv();

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

/** @type {ReadonlyArray<{ name: string, once: boolean, execute: (...args: unknown[]) => unknown }>} */
const events = [ready, messageCreate, interactionCreate];

for (const event of events) {
	const runner = (...args) => event.execute(...args);
	if (event.once) {
		client.once(event.name, runner);
	}
	else {
		client.on(event.name, runner);
	}
}

client.login(botToken);

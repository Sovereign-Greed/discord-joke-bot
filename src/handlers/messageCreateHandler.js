import {
	HELLO_TRIGGER,
	HELLO_REPLY,
	DIRECTED_GREETING_PREFIXES,
} from '../constants/phrases.js';
import { MENTION_NONE } from '../constants/safeMentions.js';
import { isDirectedAtBot } from '../guards/directedAtBot.js';
import { pickDirectedBotInsultReply } from '../services/botInsultReply.js';
import { matchTextTriggerReply } from '../services/matchTextTrigger.js';
import { parseNameIntro } from '../services/parseNameIntro.js';

const sendOpts = { allowedMentions: MENTION_NONE };

/**
 * @param {import('discord.js').Message} message
 */
export async function handleMessageCreate(message) {
	if (message.author.bot) {
		return;
	}

	const raw = message.content;
	const normalized = raw.toLowerCase();

	if (normalized === HELLO_TRIGGER) {
		await message.channel.send({ content: HELLO_REPLY, ...sendOpts });
		return;
	}

	const trimmed = normalized.trim();
	const isGreeting = DIRECTED_GREETING_PREFIXES.some((g) => trimmed === g || trimmed.startsWith(`${g} `));
	if (isGreeting && isDirectedAtBot(message, normalized)) {
		await message.channel.send({ content: 'hi. i\'m here. unfortunately for everyone.', ...sendOpts });
		return;
	}

	const introName = parseNameIntro(raw);
	if (introName) {
		await message.channel.send({ content: `Hello ${introName}, I'm joke-bot!`, ...sendOpts });
		return;
	}

	const insultReply = pickDirectedBotInsultReply(message, normalized);
	if (insultReply) {
		await message.channel.send({ content: insultReply, ...sendOpts });
		return;
	}

	const textReply = matchTextTriggerReply(normalized);
	if (textReply) {
		await message.channel.send({ content: textReply, ...sendOpts });
	}
}

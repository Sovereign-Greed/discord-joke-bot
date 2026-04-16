import {
	HELLO_TRIGGER,
	HELLO_REPLY,
	DIRECTED_GREETING_PREFIXES,
	CAT_KEYWORD,
	JOKE_REQUEST_PHRASE,
} from '../constants/phrases.js';
import { MENTION_NONE } from '../constants/safeMentions.js';
import { isDirectedAtBot } from './isDirectedAtBot.js';
import { pickDirectedBotInsultReply } from './pickDirectedBotInsultReply.js';
import { matchTextTriggerReply } from './matchTextTrigger.js';
import { parseNameIntro } from './parseNameIntro.js';
import { hasPhraseSegment, hasWholeWord } from './textMatch.js';
import { fetchCatImageSearch } from './fetchCatImage.js';
import { fetchRandomSingleJoke } from './fetchJoke.js';

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

	// "Hi joke-bot" style greetings (directed-only).
	const trimmed = normalized.trim();
	const isGreeting = DIRECTED_GREETING_PREFIXES.some((g) => trimmed === g || trimmed.startsWith(`${g} `));
	if (isGreeting && isDirectedAtBot(message, normalized)) {
		await message.channel.send({ content: 'hi. i\'m here. unfortunately for everyone.', ...sendOpts });
		return;
	}

	// Name intros before keyword replies so "im jade" stays a dad-joke name bit, not Jade's line.
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
		return;
	}

	if (hasWholeWord(normalized, CAT_KEYWORD)) {
		try {
			const res = await fetchCatImageSearch();
			const pic = res.data[0]?.url;
			if (res.status === 200 && pic) {
				await message.channel.send({ content: pic, ...sendOpts });
			}
		}
		catch {
			await message.channel.send({ content: 'Couldn\'t reach the cat API. Try again in a bit.', ...sendOpts });
		}
		return;
	}

	if (hasPhraseSegment(normalized, JOKE_REQUEST_PHRASE)) {
		try {
			const res = await fetchRandomSingleJoke();
			const joke = res.data?.joke;
			if (joke) {
				console.log({ joke });
			}
			if (res.status === 200 && joke) {
				await message.channel.send({ content: joke, ...sendOpts });
			}
		}
		catch {
			await message.channel.send({ content: 'Couldn\'t reach the joke API. Try again in a bit.', ...sendOpts });
		}
	}
}

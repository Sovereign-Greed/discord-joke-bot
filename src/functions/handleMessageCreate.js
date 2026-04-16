import { NAME_INTRO_TRIGGERS } from '../constants/triggers.js';
import {
	HELLO_TRIGGER,
	HELLO_REPLY,
	CAT_KEYWORD,
	JOKE_REQUEST_PHRASE,
} from '../constants/phrases.js';
import { pickDirectedBotInsultReply } from './pickDirectedBotInsultReply.js';
import { matchTextTriggerReply } from './matchTextTrigger.js';
import { fetchCatImageSearch } from './fetchCatImage.js';
import { fetchRandomSingleJoke } from './fetchJoke.js';

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
		await message.channel.send(HELLO_REPLY);
		return;
	}

	// Name intros before keyword replies so "im jade" stays a dad-joke name bit, not Jade's line.
	const nameIntroMatch = NAME_INTRO_TRIGGERS.find((t) => normalized.includes(`${t} `));
	if (nameIntroMatch) {
		const name = raw.slice(nameIntroMatch.length).trim();
		if (name) {
			await message.channel.send(`Hello ${name}, I'm joke-bot!`);
		}
		return;
	}

	const insultReply = pickDirectedBotInsultReply(message, normalized);
	if (insultReply) {
		await message.channel.send(insultReply);
		return;
	}

	const textReply = matchTextTriggerReply(normalized);
	if (textReply) {
		await message.channel.send(textReply);
		return;
	}

	if (normalized.includes(CAT_KEYWORD)) {
		const res = await fetchCatImageSearch();
		const pic = res.data[0]?.url;
		if (res.status === 200 && pic) {
			await message.channel.send(pic);
		}
		return;
	}

	if (normalized.includes(JOKE_REQUEST_PHRASE)) {
		const res = await fetchRandomSingleJoke();
		const joke = res.data?.joke;
		if (joke) {
			console.log({ joke });
		}
		if (res.status === 200 && joke) {
			await message.channel.send(joke);
		}
	}
}

import { NAME_INTRO_TRIGGERS } from '../constants/triggers.js';
import { BASIC_REPLIES, BASIC_TRIGGER_KEYS } from '../constants/replies.js';
import {
	HELLO_TRIGGER,
	HELLO_REPLY,
	CAT_KEYWORD,
	JOKE_REQUEST_PHRASE,
} from '../constants/phrases.js';
import { fetchCatImageSearch } from './fetchCatImage.js';
import { fetchRandomSingleJoke } from './fetchJoke.js';

/**
 * @param {import('discord.js').Message} message
 */
export async function handleMessageCreate(message) {
	if (message.author.bot) {
		return;
	}

	if (message.content.toLowerCase() === HELLO_TRIGGER) {
		await message.channel.send(HELLO_REPLY);
		return;
	}

	const messageL = message.content.toLowerCase();

	const nameIntroMatch = NAME_INTRO_TRIGGERS.find((t) => messageL.includes(`${t} `));
	const basicMatch = BASIC_TRIGGER_KEYS.find((bt) => messageL.includes(bt));
	const catMatch = messageL.includes(CAT_KEYWORD);
	const jokeRequest = messageL.includes(JOKE_REQUEST_PHRASE);

	if (nameIntroMatch) {
		const name = message.content.slice(nameIntroMatch.length).trim();
		if (name) {
			await message.channel.send(`Hello ${name}, I'm joke-bot!`);
		}
		return;
	}

	if (basicMatch) {
		const response = BASIC_REPLIES[basicMatch];
		if (response) {
			await message.channel.send(response);
		}
		return;
	}

	if (catMatch) {
		const res = await fetchCatImageSearch();
		const pic = res.data[0]?.url;
		if (res.status === 200 && pic) {
			await message.channel.send(pic);
		}
		return;
	}

	if (jokeRequest) {
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

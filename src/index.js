import { config } from 'dotenv';
import { Client, GatewayIntentBits } from 'discord.js';
import axios from 'axios';

// Load environment variables
config();

const { BOT_TOKEN } = process.env;

if (!BOT_TOKEN) {
	console.error('Missing BOT_TOKEN! Check your .env file.');
	process.exit(1);
}

// Create a new client instance with the necessary intents
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
});

// When the bot is ready
client.once('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

const triggers = [
	'im',
	'i\'m',
	'i am',
];

const basicReplies = {
	// gange triggers
	raza: 'Raza be like: synder cut is peak',
	zack: 'Zack be like: CHEEEEEEEEESE....and doughnuts',
	nina: 'Nina be like: I met obama at my HOA meeting',
	santy: 'Santy be like: there is a cave that killed 200 people, lets go!',
	kimo: 'Kimo be like: Quartertillias XD',
	danny: 'Danny be like: Hey guys...breakfast is wack yo',
	mary: 'Mary be like: OMG my heart is like so full rn',
	jade: 'Jade be like: This furthers my agenda',
	// deez nuts triggers
	candice: 'can deez nuts fit in your mouth',
	e10: 'eaten deez nuts',
	dooma: 'do ma nuts fit in your mouth',
	joe: 'joe mama',
	goblin: 'goblin deez nuts',
	'shut up joke bot': 'make me coward, and it\'s joke-bot. get the name right bozo',
	'shut up joke-bot': 'make me weirdo',
	// random
	'guess what': 'chicken butt',
	apples: 'Well I got her number, how\'d you like them apples',
	'last jedi': 'you have bad taste',
	cave: 'no santy, we are not going in that cave',
	heart: 'my heart is pretty full rn',
	agenda: 'I\'ll never tell you what furthers my agenda',
	'god father': 'zzzzzzzzzzz',
	'pokemon': 'pokemon go to the POLLS',
};

const getCatData = async () => {
	const data = await axios({ url: 'https://api.thecatapi.com/v1/images/search' });
	return data;
};

const getJoke = async () => {
	const data = await axios({ url: 'https://v2.jokeapi.dev/joke/Any?type=single' });
	return data;
};

const basicTriggers = Object.keys(basicReplies);


// Respond to messages
client.on('messageCreate', async (message) => {

	// Ignore messages sent by the bot itself
	if (message.author.bot) return;

	if (message.content.toLowerCase() === 'hello') {
		message.channel.send('Hello there!');
		return;
	}

	const messageL = message.content.toLowerCase();

	// Check if the message starts with any of the triggers
	// const match = triggers.find((t) => message.content.toLowerCase().startsWith(`${t} `));
	const match = triggers.find((t) => messageL.includes(`${t} `));
	const basicMatch = basicTriggers.find((bt) => messageL.includes(bt));
	const catMatch = messageL.includes('cat');
	const jokeRequest = messageL.includes('give me a joke');

	if (match) {
		// Extract the part after the trigger
		const name = message.content.slice(match.length).trim();
		if (name) {
			message.channel.send(`Hello ${name}, I'm joke-bot!`);
			return;
		}
		return;
	}

	if (basicMatch) {
		const response = basicReplies[basicMatch];
		if (response) {
			message.channel.send(response);
			return;
		}
		return;
	}

	if (catMatch) {
		const res = await getCatData();
		const pic = res.data[0]?.url;
		if (res.status === 200 && pic) {
			message.channel.send(pic);
			return;
		};
		return;
	}

	if (jokeRequest) {
		const res = await getJoke();
		const joke = res.data?.joke;
		console.log({ joke });
		if (res.status === 200 && joke) {
			message.channel.send(joke);
			return;
		};
		return;
	}
});

// Login to Discord
client.login(BOT_TOKEN);

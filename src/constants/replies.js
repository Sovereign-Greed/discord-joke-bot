/**
 * Substring text replies: `match` is tested against the full message in lowercase
 * (matcher also tries an apostrophe-stripped form so spelling variants still hit).
 * Triggers are sorted longest-first so shorter phrases do not steal matches.
 *
 * @typedef {{ match: string, reply: string }} TextTriggerReply
 */

/** @type {TextTriggerReply[]} */
const TEXT_TRIGGER_REPLIES = [
	// Friends / in-jokes
	{ match: 'raza', reply: 'Raza be like: synder cut is peak' },
	{ match: 'zack', reply: 'Zack be like: CHEEEEEEEEESE....and doughnuts' },
	{ match: 'nina', reply: 'Nina be like: I met obama at my HOA meeting' },
	{ match: 'santy', reply: 'Santy be like: there is a cave that killed 200 people, lets go!' },
	{ match: 'kimo', reply: 'Kimo be like: Quartertillias XD' },
	{ match: 'danny', reply: 'Danny be like: Hey guys...breakfast is wack yo' },
	{ match: 'mary', reply: 'Mary be like: OMG my heart is like so full rn' },
	{ match: 'jade', reply: 'Jade be like: This furthers my agenda' },

	// Bot attitude (long phrases first in source; final order is by length)
	{ match: 'shut up joke-bot', reply: 'make me weirdo' },
	{ match: 'shut up joke bot', reply: 'make me coward, and it\'s joke-bot. get the name right bozo' },

	// One-liners / server bits
	{ match: 'guess what', reply: 'chicken butt' },
	{ match: 'apples', reply: 'Well I got her number, how\'d you like them apples' },
	{ match: 'last jedi', reply: 'you have bad taste' },
	{ match: 'cave', reply: 'no santy, we are not going in that cave' },
	{ match: 'heart', reply: 'my heart is pretty full rn' },
	{ match: 'agenda', reply: 'I\'ll never tell you what furthers my agenda' },
	{ match: 'god father', reply: 'zzzzzzzzzzz' },
	{ match: 'pokemon', reply: 'pokemon go to the POLLS' },

	// Meme-adjacent (10)
	{ match: 'this is fine', reply: '🔥 This is fine. (narrator: it was not fine.)' },
	{ match: 'main character', reply: 'Calm down, you\'re in the B-plot of this channel.' },
	{ match: 'skill issue', reply: 'That\'s not a bug, that\'s a skill issue.' },
	{ match: 'touch grass', reply: 'I\'m pure electricity. You, however, could use some grass in 4K.' },
	{ match: 'rent free', reply: 'I\'m living rent-free in the RAM. You\'re doing great.' },
	{ match: 'womp womp', reply: 'Womp womp. Sad trombone plays in binary.' },
	{ match: 'copium', reply: 'That\'s premium-grade copium. Hydrate responsibly.' },
	{ match: 'stonks', reply: 'Stonks only go up… unless they don\'t. 📉📈' },
	{ match: 'no cap', reply: 'No cap? That\'s cap. I\'m wearing a literal server rack as a hat.' },
	{ match: 'its giving', reply: 'It\'s giving… "bot that peaked in 2016." No notes.' },
];

function byMatchLengthDesc(a, b) {
	return b.match.length - a.match.length;
}

/** @readonly */
export const TEXT_TRIGGERS = Object.freeze([...TEXT_TRIGGER_REPLIES].sort(byMatchLengthDesc));

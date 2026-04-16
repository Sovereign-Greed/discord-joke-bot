/** Substrings that mean the message is about this bot (lowercase body). Longer first for matching priority. */
export const BOT_ALIAS_SUBSTRINGS = Object.freeze([
	'joke-bot',
	'joke bot',
	'jokebot',
]);

/**
 * Insult / dismissive cues (lowercase). Sorted longest-first so `stupid bot` wins over `stupid`.
 * Only used when the message already targets the bot (alias or @mention).
 */
const INSULT_SUBSTRINGS_RAW = [
	'nobody asked you',
	'who asked you',
	'worst bot ever',
	'shut your mouth',
	'stupid bot',
	'dumb bot',
	'bad bot',
	'useless bot',
	'trash bot',
	'worst bot',
	'hate this bot',
	'screw you',
	'piss off',
	'go away',
	'nobody asked',
	'who asked',
	'shut up',
	'be quiet',
	'silence',
	'shut it',
	'zip it',
	'stfu',
	'hate you',
	'hate this',
	'i hate you',
	'i hate u',
	'hate u',
	'not funny',
	'unfunny',
	'so mid',
	'annoying',
	'garbage',
	'useless',
	'terrible',
	'cringe',
	'awful',
	'idiot',
	'moron',
	'stupid',
	'trash',
	'lame',
	'sucks',
	'suck',
	'dumb',
	'worst',
];

function byLengthDesc(a, b) {
	return b.length - a.length;
}

export const INSULT_SUBSTRINGS = Object.freeze(
	[...new Set(INSULT_SUBSTRINGS_RAW)].sort(byLengthDesc),
);

/** Random one is chosen when an insult hits. */
export const INSULT_WITTY_REPLIES = Object.freeze([
	'Make me. Also it\'s **joke-bot** — the hyphen pays rent.',
	'Strong draft. I\'m filing it under "user error: comedy not found."',
	'I\'m literally code; your rant is just extra logging. Cute, though.',
	'Okay, keyboard warrior — still online, still undefeated.',
	'Bold take from someone who can\'t silence a toaster pop-up.',
	'Weirdo energy detected. I\'m staying; you\'re welcome.',
	'Tell you what: when you ship your own bot, I\'ll consider the patch notes.',
	'That\'s adorable. Anyway, I\'ve got bits to do.',
	'You\'re giving "lost to a tutorial boss." Take a breath.',
	'I would clap back, but Discord already logged your L.',
	'Cool story — needs more dragons and fewer typos.',
	'If that was supposed to hurt, I need you to upgrade your DLC.',
]);

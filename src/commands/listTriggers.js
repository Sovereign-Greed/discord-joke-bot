import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { NAME_INTRO_TRIGGERS } from '../constants/triggers.js';
import { DIRECTED_GREETING_PREFIXES, HELLO_TRIGGER, JOKE_REQUEST_PHRASE, CAT_KEYWORD } from '../constants/phrases.js';
import { TEXT_TRIGGERS } from '../constants/replies.js';

export const data = new SlashCommandBuilder()
	.setName('list-triggers')
	.setDescription('List Joke Bot’s message triggers (non-slash)');

function formatInline(items) {
	return items.map((x) => `\`${x}\``).join(', ');
}

export async function execute(interaction) {
	const textTriggers = TEXT_TRIGGERS.map((t) => t.match);

	const sections = [
		`**Hello**: exact \`${HELLO_TRIGGER}\``,
		`**Greeting joke-bot**: ${formatInline(DIRECTED_GREETING_PREFIXES)} + (mention or “joke bot”)`,
		`**Name intro**: ${formatInline(NAME_INTRO_TRIGGERS)} + a name`,
		`**Joke**: contains \`${JOKE_REQUEST_PHRASE}\``,
		`**Cat**: contains \`${CAT_KEYWORD}\``,
		`**Keyword replies**: ${textTriggers.length} triggers (substring match)`,
	];

	const embed = new EmbedBuilder()
		.setTitle('Joke Bot — message triggers')
		.setColor(0x57F287)
		.setDescription(sections.join('\n'))
		.addFields({
			name: 'Keyword triggers',
			value: textTriggers.map((t) => `\`${t}\``).join(' · ').slice(0, 1024) || '_None_',
		})
		.setFooter({ text: 'These are message-based triggers, not slash commands.' });

	await interaction.reply({ embeds: [embed], ephemeral: true });
}


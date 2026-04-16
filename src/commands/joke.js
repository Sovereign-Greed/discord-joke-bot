import { SlashCommandBuilder } from 'discord.js';
import { MENTION_NONE } from '../constants/safeMentions.js';
import { fetchRandomSingleJoke } from '../api/joke.js';

export const data = new SlashCommandBuilder()
	.setName('joke')
	.setDescription('Get a random one-liner joke');

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	await interaction.deferReply();

	try {
		const res = await fetchRandomSingleJoke();
		const joke = res.data?.joke;
		if (joke) {
			console.log({ joke });
		}
		if (res.status === 200 && joke) {
			await interaction.editReply({ content: joke, allowedMentions: MENTION_NONE });
		}
		else {
			await interaction.editReply({ content: 'No joke came back. Try again.', allowedMentions: MENTION_NONE });
		}
	}
	catch {
		await interaction.editReply({ content: 'Couldn\'t reach the joke API. Try again in a bit.', allowedMentions: MENTION_NONE });
	}
}

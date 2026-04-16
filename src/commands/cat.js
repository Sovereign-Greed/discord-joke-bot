import { SlashCommandBuilder } from 'discord.js';
import { MENTION_NONE } from '../constants/safeMentions.js';
import { fetchCatImageSearch } from '../api/cat.js';

export const data = new SlashCommandBuilder()
	.setName('cat')
	.setDescription('Get a random cat picture');

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
	await interaction.deferReply();

	try {
		const res = await fetchCatImageSearch();
		const pic = res.data[0]?.url;
		if (res.status === 200 && pic) {
			await interaction.editReply({ content: pic, allowedMentions: MENTION_NONE });
		}
		else {
			await interaction.editReply({ content: 'No cat image came back. Try again.', allowedMentions: MENTION_NONE });
		}
	}
	catch {
		await interaction.editReply({ content: 'Couldn\'t reach the cat API. Try again in a bit.', allowedMentions: MENTION_NONE });
	}
}

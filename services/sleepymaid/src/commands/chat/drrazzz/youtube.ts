import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ApplicationCommandType, ChatInputApplicationCommandData, ChatInputCommandInteraction } from 'discord.js';

export default class YoutubeCommand implements SlashCommandInterface {
	public readonly guildIds = ['818313526720462868'];
	public readonly data = {
		name: 'youtube',
		description: 'Montre le lien de la chaine youtube de DrraZz_.',
		type: ApplicationCommandType.ChatInput,
		options: [],
	} as ChatInputApplicationCommandData;

	public async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			content:
				'<:youtube:818473733785649183> [Clique ici pour avoir le lien de la chaine youtube de DrraZz_](<https://www.youtube.com/channel/UC-bGc-EQVsAshuL4f4TupeQ>)',
		});
	}
}

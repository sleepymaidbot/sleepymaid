import { SlashCommandInterface } from '@sleepymaid/handler'
import {
	ApplicationCommandType,
	ChatInputApplicationCommandData
} from 'discord.js'

export default class TwitchCommand implements SlashCommandInterface {
	public readonly guildIds = ['818313526720462868']
	public readonly data = {
		name: 'twitch',
		description: 'Montre le lien de la chaine twitch de DrraZz_.',
		type: ApplicationCommandType.ChatInput,
		options: []
	} as ChatInputApplicationCommandData

	public async execute(interaction) {
		await interaction.reply({
			content:
				'<:twitch:818473720288378980> [Clique ici pour avoir le lien de la chaine twitch de DrraZz_](<https://www.twitch.tv/drrazz_>)'
		})
	}
}

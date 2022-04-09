import { SlashCommand } from '@sleepymaid/handler'
import { ApplicationCommandType } from 'discord.js'

export default new SlashCommand(
	{
		guildIds: ['818313526720462868'],
		data: {
			name: 'twitch',
			description: 'Montre le lien de la chaine twitch de DrraZz_.',
			type: ApplicationCommandType.ChatInput,
			options: []
		}
	},
	{
		async run(interaction) {
			await interaction.reply({
				content:
					'<:twitch:818473720288378980> [Clique ici pour avoir le lien de la chaine twitch de DrraZz_](<https://www.twitch.tv/drrazz_>)'
			})
		}
	}
)

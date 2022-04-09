import { SlashCommand } from '@sleepymaid/handler'
import { ApplicationCommandType } from 'discord.js'

export default new SlashCommand(
	{
		guildIds: ['818313526720462868'],
		data: {
			name: 'youtube',
			description: 'Montre le lien de la chaine youtube de DrraZz_.',
			type: ApplicationCommandType.ChatInput,
			options: []
		}
	},
	{
		async run(interaction) {
			await interaction.reply({
				content:
					'<:youtube:818473733785649183> [Clique ici pour avoir le lien de la chaine youtube de DrraZz_](<https://www.youtube.com/channel/UC-bGc-EQVsAshuL4f4TupeQ>)'
			})
		}
	}
)

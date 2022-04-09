import { SlashCommand } from '@sleepymaid/handler'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	CommandInteraction
} from 'discord.js'

export default new SlashCommand(
	{
		guildIds: ['324284116021542922', '860721584373497887'],
		data: {
			name: 'ratio',
			description: 'Rationalise une personne',
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: 'user',
					description: "L'utilisateur à rationaliser",
					type: ApplicationCommandOptionType.User,
					required: true
				}
			]
		}
	},
	{
		async run(interaction: CommandInteraction) {
			const user = interaction.options.get('user')
			interaction.reply(
				`Ratio à <@${user.value}> par <@${interaction.member.user.id}>.`
			)
		}
	}
)

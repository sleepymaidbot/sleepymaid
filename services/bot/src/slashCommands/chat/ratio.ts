import { SlashCommand } from '@sleepymaid/handler'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType
} from 'discord.js'
import { BotClient } from '../../lib/BotClient'

export default new SlashCommand(
	{
		guildIds: [
			'324284116021542922',
			'860721584373497887',
			'821717486217986098'
		],
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
		async run(interaction, client: BotClient) {
			const user = interaction.options.get('user')

			await interaction.reply(
				await client.localizer.get('ratio', {
					lng: interaction.locale,
					target: `<@${user.value}>`,
					author: `<@${interaction.user.id}>`
				})
			)
		}
	}
)

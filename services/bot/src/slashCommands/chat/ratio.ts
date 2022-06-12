import { SlashCommand } from '@sleepymaid/handler'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType
} from 'discord.js'
import i18next from 'i18next'
import { getLocalizedProp } from '@sleepymaid/localizer'
import { ratioGuildIds } from '../../lib/lists'

export default new SlashCommand(
	{
		guildIds: ratioGuildIds,
		data: {
			...getLocalizedProp('name', 'commands.ratio.name'),
			...getLocalizedProp('description', 'commands.ratio.description'),
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					...getLocalizedProp('name', 'commands.ratio.user.name'),
					...getLocalizedProp('description', 'commands.ratio.user.description'),
					type: ApplicationCommandOptionType.User,
					required: true
				}
			]
		}
	},
	{
		async run(interaction) {
			await interaction.reply({
				content: i18next.t('commands.ratio.ratio', {
					lng: interaction.locale,
					target: interaction.options.get('user').value,
					author: interaction.user.id
				})
			})
		}
	}
)

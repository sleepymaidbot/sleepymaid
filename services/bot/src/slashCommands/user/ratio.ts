import { UserCommandInterface } from '@sleepymaid/handler'
import { getLocalizedProp, ratioGuildIds } from '@sleepymaid/shared'
import { ApplicationCommandType } from 'discord-api-types/v10'
import { UserContextMenuCommandInteraction } from 'discord.js'
import i18next from 'i18next'

export default class RatioUserCommand implements UserCommandInterface {
	public readonly guildIds = ratioGuildIds
	public readonly data = {
		...getLocalizedProp('name', 'commands.ratio.name'),
		type: ApplicationCommandType.User
	} as const

	public async execute(interaction: UserContextMenuCommandInteraction) {
		await interaction.reply({
			content: i18next.t('commands.ratio.ratio', {
				lng: interaction.locale,
				target: interaction.options.get('user').value,
				author: interaction.user.id
			})
		})
	}
}

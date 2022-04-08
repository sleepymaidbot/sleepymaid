import { HandlerClient, UserCommand } from '@sleepymaid/handler'
import {
	UserApplicationCommandData,
	UserContextMenuCommandInteraction
} from 'discord.js'
import { ContextMenuCommandBuilder } from '@discordjs/builders'
import { ApplicationCommandType } from 'discord-api-types/v10'

export default new UserCommand(
	{
		guildIds: ['821717486217986098'],
		data: new ContextMenuCommandBuilder()
			.setName('Get User Id')
			.setType(ApplicationCommandType.User)
			.toJSON() as UserApplicationCommandData
	},
	{
		run: async (
			interaction: UserContextMenuCommandInteraction,
			client: HandlerClient
		) => {
			try {
				interaction.reply({
					content: `The user ID is ${interaction.targetUser.id}`,
					ephemeral: true
				})
				client.logger.info(`Pong!`)
			} catch (error) {
				client.logger.error(error)
			}
		}
	}
)

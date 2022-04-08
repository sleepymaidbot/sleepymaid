import { ContextMenuCommandBuilder } from '@discordjs/builders'
import { MessageCommand } from '@sleepymaid/handler'
import { ApplicationCommandType } from 'discord-api-types/v10'
import { MessageApplicationCommandData } from 'discord.js'

export default new MessageCommand(
	{
		guildIds: ['821717486217986098'],
		data: new ContextMenuCommandBuilder()
			.setName('Get Message Content')
			.setType(ApplicationCommandType.Message)
			.toJSON() as MessageApplicationCommandData
	},
	{
		run: async (interaction, client) => {
			try {
				interaction.reply(
					`The content of the targeted message is ${interaction.targetMessage.content}`
				)
			} catch (error) {
				client.logger.error(error)
			}
		}
	}
)

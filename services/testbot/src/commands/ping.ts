import { HandlerClient, SlashCommand } from '@sleepymaid-ts/handler'
import { ApplicationCommandType, CommandInteraction } from 'discord.js'

export default new SlashCommand(
	{
		data: {
			name: 'ping',
			description: 'Pings the bot to make sure everything is working',
			type: ApplicationCommandType.ChatInput,
			options: []
		}
	},
	{
		run: async (interaction: CommandInteraction, client: HandlerClient) => {
			interaction.reply({
				content: 'Pong!',
				ephemeral: true
			})
			client.logger.info(`Pong!`)
		}
	}
)

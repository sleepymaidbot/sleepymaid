import { HandlerClient, SlashCommand } from '@sleepymaid/handler'
import {
	ApplicationCommandType,
	AutocompleteInteraction,
	CommandInteraction
} from 'discord.js'

export default new SlashCommand(
	{
		data: {
			name: 'ping',
			description: 'Pings the bot to make sure everything is working',
			type: ApplicationCommandType.ChatInput,
			options: []
		},
		guildIds: ['821717486217986098']
	},
	{
		run: async (interaction: CommandInteraction, client: HandlerClient) => {
			try {
				interaction.reply({
					content: 'Pong!',
					ephemeral: true
				})
				client.logger.info(`Pong!`)
			} catch (error) {
				client.logger.error(error)
			}
		},
		autocomplete: async (interaction: AutocompleteInteraction) => {
			interaction.respond([
				{
					name: 'Pong!',
					value: 'ping'
				}
			])
		}
	}
)

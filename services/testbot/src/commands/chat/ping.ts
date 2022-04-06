import { HandlerClient, SlashCommand } from '@sleepymaid-ts/handler'
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
			interaction.reply({
				content: 'Pong!',
				ephemeral: true
			})
			client.logger.info(`Pong!`)
		},
		autocomplete: async (
			interaction: AutocompleteInteraction,
			client: HandlerClient
		) => {
			interaction.respond([
				{
					name: 'Pong!',
					value: 'ping'
				}
			])
		}
	}
)

import { HandlerClient, SlashCommandInterface } from '@sleepymaid/handler'
import {
	AutocompleteInteraction,
	ChatInputCommandInteraction
} from 'discord.js'
import { injectable } from 'tsyringe'

@injectable()
export default class PingCommand implements SlashCommandInterface {
	public readonly data = {
		name: 'ping',
		description: 'Pings the bot to make sure everything is working',
		options: []
	}
	public readonly guildIds = ['821717486217986098']

	public async execute(
		interaction: ChatInputCommandInteraction<`cached`>,
		client: HandlerClient
	) {
		try {
			interaction.reply({
				content: 'Pong!',
				ephemeral: true
			})
			client.logger.info(`Pong!`)
		} catch (error) {
			client.logger.error(error)
		}
	}

	public async autocomplete(
		interaction: AutocompleteInteraction,
		client: HandlerClient
	) {
		try {
			interaction.respond([
				{
					name: 'Pong!',
					value: 'ping'
				}
			])
			client.logger.info(`Pong!`)
		} catch (error) {
			client.logger.error(error)
		}
	}
}

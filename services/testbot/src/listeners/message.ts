import { HandlerClient, ListenerInterface } from '@sleepymaid/handler'
import { Message } from 'discord.js'

export default class MessageListener implements ListenerInterface {
	public readonly name = 'messageCreate'
	public readonly once = false

	public async execute(message: Message, client: HandlerClient) {
		client.logger.info(`Message: -> ${message.content}`)
	}
}

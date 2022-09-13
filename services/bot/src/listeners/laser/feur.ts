import { ListenerInterface } from '@sleepymaid/handler'
import { Message } from 'discord.js'
import { BotClient } from '../../lib/extensions/BotClient'

const triggers = ['quoi', 'quoi?', 'pourquoi', 'pourquoi?', 'pk', 'pk?']

export default class FeurListener implements ListenerInterface {
	public readonly name = 'messageCreate'
	public readonly once = false

	public async execute(message: Message, client: BotClient) {
		if (client.config.nodeEnv !== 'dev') return
		if (message.guild.id !== '860721584373497887') return
		let feur = false
		for (const trigger of triggers) {
			if (message.content.toLowerCase().endsWith(trigger)) {
				feur = true
				break
			}
		}

		if (feur) {
			message.reply('feur')
		}
	}
}

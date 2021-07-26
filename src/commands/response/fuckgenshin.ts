import { Message } from 'discord.js'
import { Command } from 'discord-akairo'

export default class genshinCommand extends Command {
	constructor() {
		super('fuckgenshin', {
			aliases: ['fuckgenshin'],
			cooldown: 60000,
			category: 'response',
			description: {
				content: 'fuckgenshin',
				usage: 'fuckgenshin',
				examples: ['fuckgenshin']
			}
		})
	}

	public async exec(message: Message): Promise<void> {
		message.util.send('<@&851958560413319179>')
		message.delete()
	}
}

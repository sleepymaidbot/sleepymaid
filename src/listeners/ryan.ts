import { Listener } from 'discord-akairo'
import { Message } from 'discord.js'

export default class RyanListener extends Listener {
	public constructor() {
		super('ryan', {
			emitter: 'client',
			event: 'messageCreate'
		})
	}

	public exec(message: Message): void {
		if (message.content === '.' && message.author.id === '564122371385196546') {
			const role = message.guild.roles.cache.find(
				(r) => r.id === '862462288345694210'
			)

			message.member.roles.add(role)

			message.author.send('yo parle a ecorte sinon tu pu')

			message.delete()
		}
	}
}

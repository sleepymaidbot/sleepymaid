import { Message } from 'discord.js'
import { PermissionFlagsBits } from 'discord-api-types/v10'

module.exports = {
	name: 'messageCreate',
	once: false,

	async execute(message: Message) {
		if (message.content.toLowerCase().startsWith('!ban')) {
			if (message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
				const user = message.content.split(' ').slice(1).join(' ')
				await message.channel.send(`${user} a été banne. :banana: `)
			}
		}
	}
}

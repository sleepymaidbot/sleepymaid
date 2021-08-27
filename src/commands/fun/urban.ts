import { Command } from 'discord-akairo'
import axios from 'axios'

export default class UrbanCommand extends Command {
	constructor() {
		super('urban', {
			aliases: ['urban'],
			cooldown: 20,
			args: [
				{
					id: 'search',
					type: 'string',
					match: 'content'
				}
			]
		})
	}

	async exec(message, args) {
		const request = await axios.get(
			`https://api.urbandictionary.com/v0/define?term=${args.search}`
		)
		await message.reply(
			`📚 Definitions for **${args.search}**\`\`\`fix\n${request.data.list[0].definition}\`\`\``
		)
	}
}

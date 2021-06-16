import { Message } from 'discord.js';
import { Command } from 'discord-akairo';
import { CommandInteraction } from 'discord.js';

export default class manCommand extends Command {
	constructor() {
		super('man', {
			aliases: ['man'],
			category: 'response',
			description: {
				content: 'man',
				usage: 'man',
				examples: ['man']
			}
		});
	}

	public async exec(message: Message): Promise<void> {
		message.util.send({
			files: [
				'https://cdn.discordapp.com/attachments/436249478521946191/853683744568115220/20210425_110059.png'
			]
		});
	}

	public async execSlash(message: CommandInteraction): Promise<void> {
		message.reply({
			files: [
				'https://cdn.discordapp.com/attachments/436249478521946191/853683744568115220/20210425_110059.png'
			]
		});
	}
}

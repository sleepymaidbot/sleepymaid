import { Message } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
import { CommandInteraction } from 'discord.js';

export default class manCommand extends BotCommand {
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
		message.channel.send({
			files: [
				'https://cdn.discordapp.com/attachments/436249478521946191/853683744568115220/20210425_110059.png'
			]
		});
	}

	/*public async execSlash(message: CommandInteraction): Promise<void> {
		message.reply({
			files: [
				'https://cdn.discordapp.com/attachments/436249478521946191/853683744568115220/20210425_110059.png'
			]
		})
	}*/
}

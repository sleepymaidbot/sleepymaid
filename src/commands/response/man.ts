import { Message } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';

export default class manCommand extends BotCommand {
	constructor() {
		super('man', {
			aliases: ['man'],
			category: 'response'
		});
	}

	public async exec(message: Message): Promise<void> {
		await message.channel.send({
			files: [
				'https://cdn.discordapp.com/attachments/436249478521946191/853683744568115220/20210425_110059.png'
			]
		});
	}
}

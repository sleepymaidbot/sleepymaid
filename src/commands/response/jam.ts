import { Message } from 'discord.js';
import { Command } from 'discord-akairo';

export default class PingCommand extends Command {
	constructor() {
		super('jam', {
			aliases: ['jam'],
			category: 'response',
			description: {
				content: 'jam',
				usage: 'jam',
				examples: ['jam']
			}
		});
	}

	public async exec(message: Message): Promise<void> {
		message.util.send('<a:JamCat:742398069777104977>');
	}
}

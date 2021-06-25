//import { CommandInteraction } from 'discord.js';
import { Message } from 'discord.js';
import { BotCommand } from '../../lib/extensions/BotCommand';
export default class PingCommand extends BotCommand {
	constructor() {
		super('help', {
			aliases: ['help'],
			category: 'info',
			description: {
				content: 'Help me',
				usage: 'help',
				examples: ['help']
			}
		});
	}

  public async exec(message: Message): Promise<void> {
		message.channel.send({ content: `If you are feeling suicidal or experiencing thoughts of self-harm, call one of the numbers below:

**__US__**
National Suicide Prevention Lifeline: 1-800-273-TALK
Crisis Text Line: Text "START" to 741-741
Youth-Specific services (voice/text/chat/email) from the Boys' Town National Hotline: <http://www.yourlifeyourvoice.org/Pages/ways-to-get-help.aspx>
Spanish: 1-800-SUICIDA

**__UK__**
Samaritans: 116 123
Helplines for Men from thecalmzone.net: 0800 58 58 58
ChildLine (childline.org.uk), for those 19 and under: 0800-11-11

For other countries check <https://www.reddit.com/r/SuicideWatch/wiki/hotlines>`})
  }
}

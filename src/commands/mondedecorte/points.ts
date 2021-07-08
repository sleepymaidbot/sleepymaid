import { BotCommand } from '../../lib/extensions/BotCommand';
import { activity } from '../../functions/db';

export default class pointsCommand extends BotCommand {
	constructor() {
		super('points', {
			aliases: ['points', 'mypoints'],
			channel: 'guild'
		});
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	async exec(message) {
		if (message.guild.id != '324284116021542922') return;
		const userInDB = await activity.findOne({ id: message.author.id });
		if (userInDB == null) {
			message.channel.send({
				content:
					"Tu n'a pas de points. \nCommence pas envoyer des message pour en avoir."
			});
		} else {
			if (userInDB.points == 1) {
				message.channel.send({ content: `Tu a ${userInDB.points} point.` });
			} else {
				message.channel.send({ content: `Tu a ${userInDB.points} points.` });
			}
		}
	}
}

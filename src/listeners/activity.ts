import { Listener } from 'discord-akairo';
import { activity } from '../functions/db';
import { Message } from 'discord.js';
import { pointsBlacklistedChannel } from '../config/lists';

const talkedRecently = new Set();

export default class Activity extends Listener {
	constructor() {
		super('Activity', {
			emitter: 'client',
			event: 'message'
		});
	}

	async exec(message: Message): Promise<void> {
		if (message.guild.id != '324284116021542922') return;
		if (message.author.bot) return;
		if (pointsBlacklistedChannel.includes(message.channel.id)) return;

		if (talkedRecently.has(message.author.id)) {
			return;
		} else {
			// Add points
			const userInDb = await activity.findOne({ id: message.author.id });
			if (userInDb == null) {
				const newUser = {
					id: message.author.id,
					points: 1
				};
				await activity.insert(newUser);
			} else {
				const beforePoints = userInDb.points;
				const afterPoints = beforePoints + 1;
				await activity.update(
					{ id: message.author.id },
					{ $set: { points: afterPoints } }
				);
			}

			talkedRecently.add(message.author.id);
			setTimeout(() => {
				talkedRecently.delete(message.author.id);
			}, 60000);
		}
	}
}

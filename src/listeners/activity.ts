import { Listener } from 'discord-akairo';
import { userActivityModel } from '../functions/db';
import { Message } from 'discord.js';
import { pointsBlacklistedChannel } from '../config/lists';
import { checkActifRole } from '../functions/actifrole';

const talkedRecently = new Set();

export default class Activity extends Listener {
	constructor() {
		super('Activity', {
			emitter: 'client',
			event: 'messageCreate'
		});
	}

	async exec(message: Message): Promise<void> {
		if (message.guild.id != '324284116021542922') return;
		if (message.author.bot) return;
		if (pointsBlacklistedChannel.includes(message.channel.id)) return;

		if (talkedRecently.has(message.author.id)) {
			return;
		} else {
			const userInDB = await userActivityModel.findOne({ id: message.author.id });
			if (userInDB == null || 0) {
				const newUser = new userActivityModel({
					id: message.author.id,
					points: 1
				});
				await newUser.save();
			} else {
				const beforePoints = userInDB.points;
				const afterPoints = beforePoints + 1;
				userInDB.points = afterPoints;
				await userInDB.save();

				checkActifRole(message.member, message.guild, afterPoints);
			}

			talkedRecently.add(message.author.id);
			setTimeout(() => {
				talkedRecently.delete(message.author.id);
			}, 60000);
		}
	}
}

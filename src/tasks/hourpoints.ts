import { Task } from 'discord-akairo';
import { activity } from '../functions/db';

export default class pointsRemoveTask extends Task {
	constructor() {
		super('removePoints', {
			delay: 1800000,
			runOnStart: false
		});
	}

	async exec() {
		const guild = this.client.guilds.cache.get('324284116021542922');

		guild.members.cache.forEach(async (member) => {
			const userInDb = await activity.findOne({ id: member.id });
			if (userInDb != null && userInDb.points >= 1) {
				activity.update(
					{ id: member.id },
					{ $set: { points: userInDb.points - 1 } }
				);
			}
		});
	}
}

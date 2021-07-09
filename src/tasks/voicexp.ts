import { Task } from 'discord-akairo';
import { activity } from '../functions/db';
import { pointsBlacklistedVoiceChannel } from '../config/lists';
import { checkActifRole } from '../functions/actifrole';

export default class voiceXpTask extends Task {
	constructor() {
		super('voiceXpTask', {
			delay: 300000,
			runOnStart: false
		});
	}

	async exec() {
		const guild = this.client.guilds.cache.get('324284116021542922');

		guild.channels.cache.forEach(async (channel) => {
			if (channel.type == 'voice') {
				if (pointsBlacklistedVoiceChannel.includes(channel.id)) {
					return;
				} else {
					channel.members.each(async (member) => {
						if (member.voice.mute || member.voice.deaf) {
							return;
						} else {
							const userInDb = await activity.findOne({ id: member.id });
							if (userInDb == null) {
								const newUser = {
									id: member.id,
									points: 1
								};
								await activity.insert(newUser);
							} else {
								const beforePoints = userInDb.points;
								const afterPoints = beforePoints + 1;
								await activity.update(
									{ id: member.id },
									{ $set: { points: afterPoints } }
								);
                                checkActifRole(member, guild, afterPoints)
							}
						}
					});
				}
			}
		});
	}
}

import { Task } from 'discord-akairo'
import { userActivityModel } from '../lib/utils/db'
import { pointsBlacklistedVoiceChannel } from '../config/lists'
import { checkActifRole } from '../functions/actifrole'
import { checkCustomRole } from '../functions/customrole'

export default class voiceXpTask extends Task {
	constructor() {
		super('voiceXpTask', {
			delay: 600000,
			runOnStart: false
		})
	}

	async exec() {
		const guild = this.client.guilds.cache.get('324284116021542922')

		const memberInVc = []

		guild.channels.cache.forEach(async (channel) => {
			if (channel.type == 'GUILD_VOICE') {
				if (pointsBlacklistedVoiceChannel.includes(channel.id)) {
					return
				} else {
					channel.members.each(async (member) => {
						memberInVc.push(member.id)
						if (member.voice.mute || member.voice.deaf) {
							return
						} else {
							const userInDB = await userActivityModel.findOne({
								id: member.id
							})
							if (userInDB == null || 0) {
								const newUser = new userActivityModel({
									id: member.id,
									points: 1
								})
								await newUser.save()
							} else {
								const beforePoints = userInDB.points
								const afterPoints = beforePoints + 1
								userInDB.points = afterPoints
								await userInDB.save()
								checkActifRole(member, guild, afterPoints)
								checkCustomRole(member, guild, afterPoints)
							}
						}
					})
				}
			}
		})
	}
}

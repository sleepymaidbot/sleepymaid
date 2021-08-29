import { mondecorteModel } from '../lib/utils/db'
import { pointsBlacklistedVoiceChannel } from '../config/lists'
import { checkActifRole } from '../functions/actifrole'
import { checkCustomRole } from '../functions/customrole'

module.exports = {
	interval: 300000,

	async execute(client) {
		client.logger.debug('Voice xp task started')
		const guild = client.guilds.cache.get('324284116021542922')

		const memberInVc = []

		guild.channels.cache.forEach(async (channel) => {
			if (channel.type == 'GUILD_VOICE') {
				if (pointsBlacklistedVoiceChannel.includes(channel.id)) {
					return
				}
				channel.members.each(async (member) => {
					memberInVc.push(member.id)
					if (member.voice.mute || member.voice.deaf) {
						return
					}
					const userInDB = await mondecorteModel.findOne({
						id: member.id
					})
					if (userInDB == null || 0) {
						const newUser = new mondecorteModel({
							id: member.id,
							points: 1
						})
						await newUser.save()
					} else {
						const beforePoints = userInDB.points
						const afterPoints = beforePoints + 1
						userInDB.points = afterPoints
						await userInDB.save()
						checkActifRole(member, guild, afterPoints, client)
						checkCustomRole(member, guild)
					}
				})
			}
		})
	}
}

import { mondecorteModel } from '../lib/utils/db'
import { pointsBlacklistedVoiceChannel, pointsMultiplier } from '../config/lists'
import { checkActifRole } from '../functions/actifrole'
import { checkCustomRole } from '../functions/customrole'
import { GuildMember } from 'discord.js'

module.exports = {
	interval: 300000,

	async execute(client) {
		client.logger.debug('Voice xp task started')
		const guild = await client.guilds.cache.get('324284116021542922')

		await guild.channels.cache.forEach(async (channel) => {
			if (channel.type == 'GUILD_VOICE') {
				if (pointsBlacklistedVoiceChannel.includes(channel.id)) return
				const membersInVc = await channel.members.filter(
					(member) => member.user.bot === false
				)
				if ((await membersInVc.size) <= 1) return
				await channel.members.each(async (member: GuildMember) => {
					if (member.user.bot) return
					if (member.voice.mute || member.voice.deaf) return
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
						const pointsToAdd = 1 * pointsMultiplier
						const afterPoints = beforePoints + pointsToAdd
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

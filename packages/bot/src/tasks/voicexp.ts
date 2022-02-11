import {
	pointsBlacklistedVoiceChannel,
	pointsMultiplier
} from '../config/lists'
import { GuildMember } from 'discord.js'
import { rewardChecker } from '../functions/rewardChecker'

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
					const userInDb = await client.prisma.mondecorte.findUnique({
						data: {
							id: member.id
						}
					})
					if (userInDb == null || 0) {
						await client.prisma.mondecorte.create({
							data: {
								id: member.id,
								points: 1 * pointsMultiplier
							}
						})
					} else {
						const beforePoints = userInDb.points
						const pointsToAdd = 1 * pointsMultiplier
						const afterPoints = beforePoints + pointsToAdd
						await client.prisma.mondecorte.update({
							where: { id: member.id },
							data: { points: afterPoints }
						})
						await rewardChecker(member, guild, client)
					}
				})
			}
		})
	}
}

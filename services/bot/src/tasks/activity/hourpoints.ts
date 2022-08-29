import 'reflect-metadata'
import { Channel, ChannelType, TextChannel } from 'discord.js'
import { pointToRemoveForPoints } from '@sleepymaid/shared'
import { ActivityRewardManager } from '../../lib/managers/lme/activityRewardManager'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/extensions/BotClient'
import { TaskInterface } from '@sleepymaid/handler'

function isTextChannel(channel: Channel): channel is TextChannel {
	return channel.type == ChannelType.GuildText
}

export default class HourPointsTask implements TaskInterface {
	public readonly interval = '0 * * * *'

	public async execute(client: BotClient) {
		if (client.config.environment === 'production') return
		client.logger.debug('Hourpoints task started')
		const usersArray = []
		const docs = await client.prisma.mondecorte.findMany()
		const guild = client.guilds.cache.get('324284116021542922')
		for (const user of docs) {
			const userInDb = await client.prisma.mondecorte.findUnique({
				where: { user_id: user.user_id }
			})
			if (userInDb != null && userInDb.points >= 1) {
				let pointsToLoose = 1
				pointToRemoveForPoints.forEach((e) => {
					if (e.need <= userInDb.points) pointsToLoose = e.remove
				})

				const newPoints = userInDb.points - pointsToLoose
				await client.prisma.mondecorte.update({
					where: { user_id: user.user_id },
					data: { points: newPoints }
				})
				usersArray.push(user.user_id)

				try {
					const dUser = guild.members.cache.get(user.user_id)
					if (dUser) {
						container.register(BotClient, { useValue: client })
						container.resolve(ActivityRewardManager).checkActivityReward(dUser)
					}
				} catch (e) {
					client.logger.error(e)
				}
			}
			const logChannel = client.channels.cache.get('863117686334554142')
			if (!isTextChannel(logChannel)) return
			await logChannel.send({
				content: `**Hourly points**\n${usersArray.length} members have been removed activity points.`
			})
			client.logger.info(
				`${usersArray.length} members have been removed activity points.`
			)
		}
	}
}

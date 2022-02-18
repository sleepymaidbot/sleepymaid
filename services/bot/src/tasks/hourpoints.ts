import { TextChannel } from 'discord.js'
import { pointToRemoveForPoints } from '../config/lists'
import { rewardChecker } from '../functions/rewardChecker'

module.exports = {
	interval: 3600000,

	async execute(client) {
		client.logger.debug('Hourpoints task started')
		const usersArray = []
		const docs = await client.prisma.mondecorte.findMany()
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
				usersArray.push(user.id)

				try {
					const guild = await client.guilds.cache.get('324284116021542922')
					const dUser = await guild.members.cache.get(user.user_id)
					await rewardChecker(dUser, guild, client)
				} catch (e) {
					client.logger.error(e)
				}
			}
		}
		const logChannel = (await client.channels.cache.get(
			'863117686334554142'
		)) as TextChannel
		await logChannel.send({
			content: `**Hourly points**\n${usersArray.length} members have been removed activity points.`
		})
		client.logger.info(
			`${usersArray.length} members have been removed activity points.`
		)
	}
}

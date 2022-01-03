import { TextChannel } from 'discord.js'
import { mondecorteModel } from '../lib/utils/db'
import { pointToRemoveForPoints } from '../config/lists'
import { rewardChecker } from '../functions/rewardChecker'

module.exports = {
	interval: 3600000,

	async execute(client) {
		client.logger.debug('Hourpoints task started')
		const usersArray = []
		await mondecorteModel.find({}).then(async (docs) => {
			for (const user of docs) {
				const userInDB = await mondecorteModel.findOne({ id: user.id })
				if (userInDB != null && userInDB.points >= 1) {
					let pointsToLoose = 1
					pointToRemoveForPoints.forEach((e) => {
						if (e.need <= userInDB.points) pointsToLoose = e.remove
					})

					userInDB.points = userInDB.points - pointsToLoose
					await userInDB.save()
					usersArray.push(user.id)

					try { 
						const guild = await client.guilds.cache.get('324284116021542922')
						const dUser = await guild.members.cache.get(user.id)
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
		})
	}
}

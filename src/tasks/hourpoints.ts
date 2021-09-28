import { TextChannel } from 'discord.js'
import { mondecorteModel } from '../lib/utils/db'
import { pointToRemoveForPoints } from '../config/lists'

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
				}
			}
			const logChannel = client.channels.cache.get(
				'863117686334554142'
			) as TextChannel
			await logChannel.send(
				`**Hourly points**\n${usersArray.length} members have been removed  activity points.`
			)
			client.logger.info(
				`${usersArray.length} members have been removed activity points.`
			)
		})
	}
}

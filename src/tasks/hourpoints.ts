import { TextChannel } from 'discord.js'
import { mondecorteModel } from '../lib/utils/db'

module.exports = {
	interval: 3600000,

	async execute(client) {
		client.logger.debug('Hourpoints task started')
		const usersArray = []
		await mondecorteModel.find({}).then(async (docs) => {
			for (const user of docs) {
				const userInDB = await mondecorteModel.findOne({ id: user.id })
				if (userInDB != null && userInDB.points >= 1) {
					userInDB.points = userInDB.points - 1
					await userInDB.save()
					usersArray.push(user.id)
				}
			}
			const logChannel = client.channels.cache.get(
				'863117686334554142'
			) as TextChannel
			await logChannel.send(
				`${usersArray.length} members have been removed 1 activity points.`
			)
			client.logger.info(
				`${usersArray.length} members have been removed 1 activity points.`
			)
		})
	}
}

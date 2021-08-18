import { Task } from 'discord-akairo'
import { TextChannel } from 'discord.js'
import { mondecorteModel } from '../lib/utils/db'

export default class pointsRemoveTask extends Task {
	constructor() {
		super('removePoints', {
			delay: 3600000,
			runOnStart: false
		})
	}

	async exec() {
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
			const logChannel = this.client.channels.cache.get(
				'863117686334554142'
			) as TextChannel
			await logChannel.send(
				`${usersArray.length} members have been removed 1 activity points.`
			)
		})
	}
}

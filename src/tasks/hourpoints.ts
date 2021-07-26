import { Task } from 'discord-akairo'
import { TextChannel } from 'discord.js'
import { userActivityModel } from '../functions/db'

export default class pointsRemoveTask extends Task {
	constructor() {
		super('removePoints', {
			delay: 1800000,
			runOnStart: true
		})
	}

	async exec() {
		

		await userActivityModel.find({}).then(async (docs) => {
			docs.forEach(async (user) => {
				const userInDB = await userActivityModel.findOne({ id: user.id })
				if (userInDB != null && userInDB.points >= 1) {
					userInDB.points = userInDB.points - 1
					await userInDB.save()
				}
			})
			const logChannel = this.client.channels.cache.get(
				'863117686334554142'
			) as TextChannel
			const guild = this.client.guilds.cache.get('324284116021542922')
			await logChannel.send(
				`${guild.members.cache.size} members have been removed 1 activity points.`
			)
		})
	}
}

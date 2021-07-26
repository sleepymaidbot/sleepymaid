import { Task } from 'discord-akairo'
import { userActivityModel } from '../functions/db'

export default class pointsRemoveTask extends Task {
	constructor() {
		super('removePoints', {
			delay: 1800000,
			runOnStart: false
		})
	}

	async exec() {
		const guild = this.client.guilds.cache.get('324284116021542922')

		guild.members.cache.forEach(async (member) => {
			const userInDB = await userActivityModel.findOne({ id: member.id })
			if (userInDB != null && userInDB.points >= 1) {
				userInDB.points = userInDB.points - 1
				await userInDB.save()
			}
		})
	}
}

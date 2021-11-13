import { mondecorteModel } from '../../lib/utils/db'
import { Message } from 'discord.js'
import {
	pointsBlacklistedTextChannel,
	pointsMultiplier
} from '../../config/lists'
import { rewardChecker } from '../../functions/rewardChecker'

const talkedRecently = new Set()

module.exports = {
	name: 'messageCreate',
	once: false,

	async execute(message: Message, client) {
		if (message.guild == null) return
		if (message.guild.id != '324284116021542922') return
		if (message.author.bot) return
		if (pointsBlacklistedTextChannel.includes(message.channel.id)) return

		if (talkedRecently.has(message.author.id)) {
			return
		}
		const userInDB = await mondecorteModel.findOne({
			id: message.author.id
		})
		if (userInDB == null || 0) {
			const newUser = new mondecorteModel({
				id: message.author.id,
				points: 1
			})
			await newUser.save()
		} else {
			const beforePoints = userInDB.points
			const pointsToAdd = 1 * pointsMultiplier
			const afterPoints = beforePoints + pointsToAdd
			userInDB.points = afterPoints
			await userInDB.save()

			await rewardChecker(message.member, message.guild, client)
		}

		talkedRecently.add(message.author.id)
		setTimeout(() => {
			talkedRecently.delete(message.author.id)
		}, 60000)
	}
}

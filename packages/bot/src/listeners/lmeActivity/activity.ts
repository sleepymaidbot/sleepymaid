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
		const userInDb = await client.prisma.mondecorte.findUnique({
			where: {
				id: message.author.id
			}
		})
		if (userInDb == null || 0) {
			await client.prisma.mondecorte.create({
				data: {
					id: message.author.id,
					points: 1 * pointsMultiplier
				}
			})
		} else {
			const beforePoints = userInDb.points
			const pointsToAdd = 1 * pointsMultiplier
			const afterPoints = beforePoints + pointsToAdd
			await client.prisma.mondecorte.update({
				where: {
					id: message.author.id
				},
				data: {
					points: afterPoints
				}
			})

			await rewardChecker(message.member, message.guild, client)
		}

		talkedRecently.add(message.author.id)
		setTimeout(() => {
			talkedRecently.delete(message.author.id)
		}, 60000)
	}
}

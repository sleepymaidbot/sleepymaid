import 'reflect-metadata'
import { Message } from 'discord.js'
import { pointsBlacklistedTextChannel, pointsMultiplier } from '../../lib/lists'
import { ActivityRewardManager } from '../../lib/activityRewardManager'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/BotClient'

const talkedRecently = new Set()

module.exports = {
	name: 'messageCreate',
	once: false,

	async execute(message: Message, client: BotClient) {
		if (message.guild == null) return
		if (message.guild.id != '324284116021542922') return
		if (message.author.bot) return
		if (pointsBlacklistedTextChannel.includes(message.channel.id)) return

		if (talkedRecently.has(message.author.id)) {
			return
		}
		const userInDb = await client.prisma.mondecorte.findUnique({
			where: {
				user_id: message.author.id
			}
		})
		if (userInDb == null || 0) {
			await client.prisma.mondecorte.create({
				data: {
					user_id: message.author.id,
					points: 1 * pointsMultiplier
				}
			})
		} else {
			const beforePoints = userInDb.points
			const pointsToAdd = 1 * pointsMultiplier
			const afterPoints = beforePoints + pointsToAdd
			await client.prisma.mondecorte.update({
				where: {
					user_id: message.author.id
				},
				data: {
					points: afterPoints
				}
			})

			container.register(BotClient, { useValue: client })
			container
				.resolve(ActivityRewardManager)
				.checkActivityReward(message.member)
		}

		talkedRecently.add(message.author.id)
		setTimeout(() => {
			talkedRecently.delete(message.author.id)
		}, 60000)
	}
}

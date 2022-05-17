import 'reflect-metadata'
import { Message } from 'discord.js'
import { pointsBlacklistedTextChannel, pointsMultiplier } from '../../lib/lists'
import { ActivityRewardManager } from '../../lib/managers/lme/activityRewardManager'
import { container } from 'tsyringe'
import { BotClient } from '../../lib/extensions/BotClient'
import { Listener } from '@sleepymaid/handler'

const talkedRecently = new Set()

export default new Listener(
	{
		name: 'messageCreate',
		once: false
	},
	{
		async run(message: Message, client: BotClient) {
			if (message.guild == null) return
			if (message.guild.id != '324284116021542922') return
			if (message.author.bot) return
			if (pointsBlacklistedTextChannel.includes(message.channel.id)) return

			if (talkedRecently.has(message.author.id)) return
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

				const c = container
				c.register(BotClient, { useValue: client })
				c.resolve(ActivityRewardManager).checkActivityReward(message.member)
			}

			talkedRecently.add(message.author.id)
			setTimeout(() => {
				talkedRecently.delete(message.author.id)
			}, 60000)
		}
	}
)

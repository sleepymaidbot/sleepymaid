import 'reflect-metadata'
import { GuildMember } from 'discord.js'
import { singleton, container } from 'tsyringe'
import { BotClient } from '../../extensions/BotClient'
import { Stopwatch } from '@sapphire/stopwatch'
import { pointsMultiplier } from '../../lists'
import { ActivityRewardManager } from './activityRewardManager'

const stopwatchs = new Map<string, Stopwatch>()

@singleton()
export class voiceXpManager {
	public declare client: BotClient
	public constructor(client: BotClient) {
		this.client = client
	}

	public async start(member: GuildMember) {
		stopwatchs.set(member.id, new Stopwatch())
		this.client.logger.info('Started voice time for ' + member.user.tag)
	}

	public async stop(member: GuildMember) {
		if (!stopwatchs[member.id]) return
		const stopwatch = stopwatchs[member.id]
		const time = Math.floor(stopwatch.duration / 300000)
		stopwatch.stop()
		delete stopwatchs[member.id]
		this.reward(member, time)
		this.client.logger.info('Stopped voice time for ' + member.user.tag)
	}

	public async reward(member: GuildMember, time: number) {
		if (time <= 1) return
		const userInDb = await this.client.prisma.mondecorte.findUnique({
			where: {
				user_id: member.id
			}
		})
		if (userInDb == null || 0) {
			await this.client.prisma.mondecorte.create({
				data: {
					user_id: member.id,
					points: time * pointsMultiplier
				}
			})
		} else {
			const beforePoints = userInDb.points
			const pointsToAdd = time * pointsMultiplier
			const afterPoints = beforePoints + pointsToAdd
			await this.client.prisma.mondecorte.update({
				where: { user_id: member.id },
				data: { points: afterPoints }
			})
			this.client.logger.info(
				'Added ' + pointsToAdd + ' points to ' + member.user.tag
			)
			const c = container
			c.register(BotClient, { useValue: this.client })
			c.resolve(ActivityRewardManager).checkActivityReward(member)
		}
	}
}

export async function stopAll(client: BotClient) {
	for (const [key, value] of Object.entries(stopwatchs)) {
		const stopwatch = stopwatchs[value]
		const time = Math.floor(stopwatch.duration / 300000)
		stopwatch.stop()
		delete stopwatchs[value]
		if (time <= 1) return
		const userInDb = await client.prisma.mondecorte.findUnique({
			where: {
				user_id: key
			}
		})
		if (userInDb == null || 0) {
			await client.prisma.mondecorte.create({
				data: {
					user_id: key,
					points: time * pointsMultiplier
				}
			})
		} else {
			const beforePoints = userInDb.points
			const pointsToAdd = time * pointsMultiplier
			const afterPoints = beforePoints + pointsToAdd
			await client.prisma.mondecorte.update({
				where: { user_id: key },
				data: { points: afterPoints }
			})
		}
	}
	return true
}

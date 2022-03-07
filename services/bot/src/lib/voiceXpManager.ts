import 'reflect-metadata'
import { GuildMember } from 'discord.js'
import { singleton, container } from 'tsyringe'
import { BotClient } from './BotClient'
import { Stopwatch } from '@sapphire/stopwatch'
import { pointsMultiplier } from './lists'
import { ActivityRewardManager } from './activityRewardManager'

const stopwatchs = {}

@singleton()
export class voiceXpManager {
	public declare client: BotClient
	public constructor(client: BotClient) {
		this.client = client
	}

	public async start(member: GuildMember) {
		stopwatchs[member.id] = new Stopwatch()
		this.client.logger.info('Started voice time for ' + member.user.tag)
	}

	public async stop(member: GuildMember) {
		if (!stopwatchs[member.id]) return
		const stopwatch = stopwatchs[member.id]
		const time = Math.floor(stopwatch.duration / 3000000)
		stopwatch.stop()
		delete stopwatchs[member.id]
		this._reward(member, time)
		this.client.logger.info('Stopped voice time for ' + member.user.tag)
	}

	public async stopAll() {
		const guild = this.client.guilds.cache.get('324284116021542922')
		for (const key in stopwatchs) {
			const stopwatch = stopwatchs[key]
			const time = Math.floor(stopwatch.duration / 3000000)
			stopwatch.stop()
			delete stopwatchs[key]
			this._reward(guild.members.cache.get(key) as GuildMember, time)
		}
		return true
	}

	private async _reward(member: GuildMember, time: number) {
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
			container.register(BotClient, { useValue: this.client })
			container.resolve(ActivityRewardManager).checkActivityReward(member)
		}
	}
}

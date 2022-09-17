import 'reflect-metadata';
import { Collection, GuildMember } from 'discord.js';
import { singleton, container } from 'tsyringe';
import { BotClient } from '../../extensions/BotClient';
import { Stopwatch } from '@sapphire/stopwatch';
import { pointsMultiplier } from '@sleepymaid/shared';
import { ActivityRewardManager } from './activityRewardManager';
import { baseManager } from '../BaseManager';

const stopwatchs = new Collection<string, Stopwatch>();

@singleton()
export class voiceXpManager extends baseManager {
	public async start(member: GuildMember) {
		// TODO: Check if the user already has a stopwatch
		if (stopwatchs.get(member.id) !== undefined) return;
		stopwatchs.set(member.id, new Stopwatch());
		this.client.logger.info('Started voice time for ' + member.user.tag);
	}

	public async stop(member: GuildMember) {
		const stopwatch = stopwatchs.get(member.id);
		if (!stopwatch) return;
		stopwatch.stop();
		const time = Math.floor(stopwatch.duration / 300000);
		stopwatchs.delete(member.id);
		this.reward(member, time);
		this.client.logger.info('Stopped voice time for ' + member.user.tag);
	}

	public async reward(member: GuildMember, time: number) {
		if (time <= 1) return;
		const userInDb = await this.client.prisma.mondecorte.findUnique({
			where: {
				user_id: member.id,
			},
		});
		if (userInDb == null || 0) {
			await this.client.prisma.mondecorte.create({
				data: {
					user_id: member.id,
					points: time * pointsMultiplier,
				},
			});
		} else {
			const pointsToAdd = time * pointsMultiplier;
			await this.client.prisma.mondecorte.update({
				where: { user_id: member.id },
				data: {
					points: {
						increment: pointsToAdd,
					},
				},
			});
			this.client.logger.info('Added ' + pointsToAdd + ' points to ' + member.user.tag);
			const c = container;
			c.register(BotClient, { useValue: this.client });
			c.resolve(ActivityRewardManager).checkActivityReward(member);
		}
	}
}

export async function stopAll(client: BotClient) {
	for (const [key, value] of stopwatchs.entries()) {
		const stopwatch = value;
		const time = Math.floor(stopwatch.duration / 300000);
		stopwatch.stop();
		stopwatchs.delete(key);
		if (time <= 1) return;
		const userInDb = await client.prisma.mondecorte.findUnique({
			where: {
				user_id: key,
			},
		});
		if (userInDb == null || 0) {
			await client.prisma.mondecorte.create({
				data: {
					user_id: key,
					points: time * pointsMultiplier,
				},
			});
		} else {
			const pointsToAdd = time * pointsMultiplier;
			await this.client.prisma.mondecorte.update({
				where: { user_id: key },
				data: {
					points: {
						increment: pointsToAdd,
					},
				},
			});
		}
	}
}

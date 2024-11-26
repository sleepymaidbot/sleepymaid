import { DrizzleInstance, logChannel } from "@sleepymaid/db";
import { WatcherClient } from "./WatcherClient";
import { Redis } from "iovalkey";
import { eq, InferSelectModel } from "drizzle-orm";

export default class Manager {
	private declare client: WatcherClient;

	private declare drizzle: DrizzleInstance;

	private declare redis: Redis;

	constructor(client: WatcherClient) {
		this.client = client;
		this.drizzle = client.drizzle;
		this.redis = client.redis;
	}

	public async getLogChannel(guildId: string): Promise<InferSelectModel<typeof logChannel>[] | null> {
		const redisKey = `logChannel:${guildId}`;
		const channel = await this.redis.get(redisKey);

		if (channel) {
			return JSON.parse(channel) as InferSelectModel<typeof logChannel>[];
		}

		const data = await this.drizzle.query.logChannel.findMany({ where: eq(logChannel.guildId, guildId) });
		if (!data) return null;

		await this.redis.set(redisKey, JSON.stringify(data));
		await this.redis.expire(redisKey, 3600);
		return data;
	}

	public async updateLogChannels(guildId: string) {
		const channels = await this.drizzle.query.logChannel.findMany({ where: eq(logChannel.guildId, guildId) });
		if (!channels) return;

		await this.redis.set(`logChannel:${guildId}`, JSON.stringify(channels));
		await this.redis.expire(`logChannel:${guildId}`, 3600);
	}
}

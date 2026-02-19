import { DrizzleInstance, logChannel, modCase, roleWeight } from "@sleepymaid/db"
import type { InferSelectModel } from "drizzle-orm"
import { GuildMember, User, WebhookClient, WebhookMessageCreateOptions } from "discord.js"
import { eq, max } from "drizzle-orm"
import { Redis } from "iovalkey"
import { WatcherClient } from "./WatcherClient"

export default class Manager {
	private declare client: WatcherClient

	private declare drizzle: DrizzleInstance

	private declare redis: Redis

	constructor(client: WatcherClient) {
		this.client = client
		this.drizzle = client.drizzle
		this.redis = client.redis
	}

	public async getLogChannel(guildId: string): Promise<InferSelectModel<typeof logChannel>[] | null> {
		const redisKey = `logChannel:${guildId}`
		const channel = await this.redis.get(redisKey)

		if (channel) {
			return JSON.parse(channel) as InferSelectModel<typeof logChannel>[]
		}

		const data = await this.drizzle.query.logChannel.findMany({ where: eq(logChannel.guildId, guildId) })
		if (!data) return null

		await this.redis.set(redisKey, JSON.stringify(data))
		await this.redis.expire(redisKey, 3600)
		return data
	}

	public async updateLogChannels(guildId: string) {
		const channels = await this.drizzle.query.logChannel.findMany({ where: eq(logChannel.guildId, guildId) })
		if (!channels) return

		await this.redis.set(`logChannel:${guildId}`, JSON.stringify(channels))
		await this.redis.expire(`logChannel:${guildId}`, 3600)
	}

	public async sendLog(channel: InferSelectModel<typeof logChannel>, message: WebhookMessageCreateOptions) {
		const webhook = new WebhookClient({
			id: channel.webhookId,
			token: channel.webhookToken,
		})

		await webhook
			.send({
				username: `${this.client.user?.displayName}`,
				avatarURL: this.client.user?.displayAvatarURL(),
				threadId: channel.threadId ?? undefined,
				...message,
			})
			.catch((e) => {
				this.client.logger.error(e)
				this.client.logger.error(`Failed to send log to ${channel.id} (${channel.channelId})`)
				// TODO: Fetch webhooks or delete the log channel
			})

		webhook.destroy()
	}

	public async sendModLog(channels: InferSelectModel<typeof logChannel>[], message: WebhookMessageCreateOptions) {
		const channel = channels.find((c) => Object.values(c.moderationEvents).some(Boolean))
		if (!channel) return
		await this.sendLog(channel, message)
	}

	public async getNextCaseNumber(guildId: string): Promise<number> {
		return await this.drizzle.transaction(async (tx) => {
			const [row] = await tx
				.select({ m: max(modCase.caseNumber) })
				.from(modCase)
				.where(eq(modCase.guildId, guildId))
				.for("update")
			return (row?.m ?? 0) + 1
		})
	}

	public async sendModDm(
		user: User,
		guildName: string,
		opts: {
			caseNumber: number
			type: string
			reason: string | null
			modTag: string
			duration?: string
			expiresAt?: Date
		},
	) {
		const lines = [
			`You have been **${opts.type}** in **${guildName}**.`,
			`**Case #${opts.caseNumber}**`,
			`**Reason:** ${opts.reason ?? "None"}`,
			`**Moderator:** ${opts.modTag}`,
		]
		if (opts.duration) lines.splice(2, 0, `**Duration:** ${opts.duration}`)
		if (opts.expiresAt)
			lines.splice(2 + (opts.duration ? 1 : 0), 0, `**Expires:** <t:${Math.floor(opts.expiresAt.getTime() / 1000)}:R>`)
		await user.send({ content: lines.join("\n") }).catch((e) => {
			this.client.logger.debug(`Could not DM ${user.id}: ${e instanceof Error ? e.message : String(e)}`)
		})
	}

	public async compareUserWeight(member1: GuildMember, member2: GuildMember) {
		const redisKey = `roleWeights:${member1.guild.id}`
		const cached = await this.redis.get(redisKey)
		let roles: InferSelectModel<typeof roleWeight>[]

		if (cached) {
			roles = JSON.parse(cached) as InferSelectModel<typeof roleWeight>[]
		} else {
			roles = await this.drizzle.query.roleWeight.findMany({ where: eq(roleWeight.guildId, member1.guild.id) })
			await this.redis.set(redisKey, JSON.stringify(roles))
			await this.redis.expire(redisKey, 3600)
		}

		const roles1 = roles.filter((r) => member1.roles.cache.has(r.roleId))
		const roles2 = roles.filter((r) => member2.roles.cache.has(r.roleId))

		const highest1 = roles1.length > 0 ? Math.max(...roles1.map((r) => r.weight)) : 0
		const highest2 = roles2.length > 0 ? Math.max(...roles2.map((r) => r.weight)) : 0

		return {
			weight1: highest1,
			weight2: highest2,
		}
	}

	public async invalidateRoleWeightsCache(guildId: string): Promise<void> {
		await this.redis.del(`roleWeights:${guildId}`)
	}
}

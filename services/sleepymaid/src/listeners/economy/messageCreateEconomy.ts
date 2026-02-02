import { userData } from "@sleepymaid/db"
import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import { Message } from "discord.js"
import { sql } from "drizzle-orm"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class MessageCreateEconomyListener extends Listener<"messageCreate", SleepyMaidClient> {
	private cooldowns = new Map<string, number>()

	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		})
	}

	public override async execute(message: Message) {
		if (message.author.bot) return
		if (message.channel.isDMBased()) return

		const lastMessage = this.cooldowns.get(message.author.id)
		const now = Date.now()
		if (lastMessage && now - lastMessage < 60000) return // 60 seconds cooldown

		this.cooldowns.set(message.author.id, now)
		const reward = Math.floor(Math.random() * 3) + 1

		await this.container.client.drizzle
			.insert(userData)
			.values({
				userId: message.author.id,
				userName: message.author.username,
				displayName: message.author.displayName,
				avatarHash: message.author.avatar,
				currency: reward,
			})
			.onConflictDoUpdate({
				target: userData.userId,
				set: {
					userName: message.author.username,
					displayName: message.author.displayName,
					avatarHash: message.author.avatar,
					currency: sql`${userData.currency} + ${reward}`,
				},
			})

		this.container.client.logger.debug(
			`${message.author.username} (${message.author.id}) earned ${reward} coins for sending a message!`,
		)
	}
}

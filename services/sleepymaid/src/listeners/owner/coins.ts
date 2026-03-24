import { userData } from "@sleepymaid/db"
import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { Message } from "discord.js"
import { eq, sql } from "drizzle-orm"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

function parseUserId(token: string): string | null {
	const mention = /^<@!?(\d+)>$/.exec(token)
	if (mention?.[1]) return mention[1]
	if (/^\d{17,20}$/.test(token)) return token
	return null
}

export default class CoinsCommandListener extends Listener<"messageCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		})
	}

	public override async execute(message: Message) {
		if (message.author.id !== "324281236728053760") return
		const client = this.container.client
		if (!client.user) return

		const botMention = new RegExp(`^<@!?${client.user.id}>\\s+coins\\s+`, "i")
		if (!botMention.test(message.content)) return

		const rest = message.content.replace(botMention, "").trim()
		const parts = rest.split(/\s+/)
		const channel = message.channel
		if (!channel.isSendable()) return

		if (parts.length < 3) {
			await channel.send(`Usage: \`<@${client.user.id}> coins <add|remove|set> <user|id> <amount>\``)
			return
		}

		const sub = parts[0]?.toLowerCase()
		if (sub !== "add" && sub !== "remove" && sub !== "set") {
			await channel.send("Subcommand must be `add`, `remove`, or `set`.")
			return
		}

		const targetId = parseUserId(parts[1] ?? "")
		if (!targetId) {
			await channel.send("Invalid user mention or id.")
			return
		}

		const amount = Number.parseInt(parts[2] ?? "", 10)
		if (!Number.isFinite(amount) || !Number.isInteger(amount)) {
			await channel.send("Amount must be an integer.")
			return
		}

		if (sub === "set") {
			if (amount < 0) {
				await channel.send("Amount must be zero or positive for `set`.")
				return
			}
		} else if (amount <= 0) {
			await channel.send("Amount must be positive for `add` and `remove`.")
			return
		}

		let discordUser
		try {
			discordUser = await client.users.fetch(targetId)
		} catch {
			await channel.send("Could not fetch that user.")
			return
		}

		const drizzle = client.drizzle
		const baseRow = {
			userId: discordUser.id,
			userName: discordUser.username,
			displayName: discordUser.displayName ?? null,
			avatarHash: discordUser.avatar,
		}

		if (sub === "add") {
			await drizzle
				.insert(userData)
				.values({
					...baseRow,
					currency: amount,
				})
				.onConflictDoUpdate({
					target: userData.userId,
					set: {
						userName: baseRow.userName,
						displayName: baseRow.displayName,
						avatarHash: baseRow.avatarHash,
						currency: sql`${userData.currency} + ${amount}`,
					},
				})
		} else if (sub === "remove") {
			await drizzle
				.insert(userData)
				.values({
					...baseRow,
					currency: 0,
				})
				.onConflictDoUpdate({
					target: userData.userId,
					set: {
						userName: baseRow.userName,
						displayName: baseRow.displayName,
						avatarHash: baseRow.avatarHash,
						currency: sql`GREATEST(0::bigint, ${userData.currency} - ${amount}::bigint)`,
					},
				})
		} else {
			await drizzle
				.insert(userData)
				.values({
					...baseRow,
					currency: amount,
				})
				.onConflictDoUpdate({
					target: userData.userId,
					set: {
						userName: baseRow.userName,
						displayName: baseRow.displayName,
						avatarHash: baseRow.avatarHash,
						currency: amount,
					},
				})
		}

		const row = await drizzle.query.userData.findFirst({
			where: eq(userData.userId, targetId),
		})

		await channel.send(
			`${sub === "add" ? "Added" : sub === "remove" ? "Removed" : "Set"} coins for **${discordUser.tag}** (${targetId}). New balance: **${row?.currency ?? amount}**`,
		)
	}
}

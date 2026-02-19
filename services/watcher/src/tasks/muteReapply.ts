import { modCase } from "@sleepymaid/db"
import { Context, Task } from "@sleepymaid/handler"
import { and, eq, gt, isNull } from "drizzle-orm"
import { WatcherClient } from "../lib/extensions/WatcherClient"

const DISCORD_MAX_TIMEOUT_MS = 28 * 24 * 3600 * 1000

export default class extends Task<WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			interval: "0 0 * * *",
			runOnStart: true,
		})
	}

	public override async execute() {
		const drizzle = this.container.drizzle
		const now = new Date()
		const activeMutes = await drizzle.query.modCase.findMany({
			where: and(eq(modCase.type, "timeout"), gt(modCase.expiresAt, now), isNull(modCase.resolvedAt)),
		})
		if (activeMutes.length === 0) return

		const nowMs = Date.now()
		for (const c of activeMutes) {
			try {
				const guild = await this.container.client.guilds.fetch(c.guildId).catch(() => null)
				if (!guild) continue
				const member = await guild.members.fetch(c.userId).catch(() => null)
				if (!member) continue

				const expiresAt = c.expiresAt!.getTime()
				const remainingMs = expiresAt - nowMs
				if (remainingMs <= 0) {
					await member.timeout(null).catch(() => null)
					await drizzle
						.update(modCase)
						.set({ resolvedAt: new Date() })
						.where(and(eq(modCase.guildId, c.guildId), eq(modCase.caseNumber, c.caseNumber)))
					continue
				}

				const until = member.communicationDisabledUntilTimestamp
				if (until !== null && until > nowMs + 86400_000) continue

				const timeoutMs = Math.min(DISCORD_MAX_TIMEOUT_MS, remainingMs)
				await member.timeout(timeoutMs, c.reason ?? undefined)

				if (remainingMs <= DISCORD_MAX_TIMEOUT_MS)
					await drizzle
						.update(modCase)
						.set({ resolvedAt: new Date() })
						.where(and(eq(modCase.guildId, c.guildId), eq(modCase.caseNumber, c.caseNumber)))
			} catch (error) {
				this.container.logger.error(
					`Mute reapply failed for ${c.userId} in ${c.guildId}: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		}
	}
}

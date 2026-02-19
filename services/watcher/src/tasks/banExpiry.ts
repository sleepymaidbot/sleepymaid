import { modCase } from "@sleepymaid/db"
import { Context, Task } from "@sleepymaid/handler"
import { and, eq, isNotNull, isNull, lte } from "drizzle-orm"
import { WatcherClient } from "../lib/extensions/WatcherClient"

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
		const expired = await drizzle.query.modCase.findMany({
			where: and(
				eq(modCase.type, "ban"),
				isNotNull(modCase.expiresAt),
				lte(modCase.expiresAt, now),
				isNull(modCase.resolvedAt),
			),
		})
		if (expired.length === 0) return

		for (const c of expired) {
			try {
				const guild = await this.container.client.guilds.fetch(c.guildId).catch(() => null)
				if (!guild) {
					await drizzle
						.update(modCase)
						.set({ resolvedAt: now })
						.where(and(eq(modCase.guildId, c.guildId), eq(modCase.caseNumber, c.caseNumber)))
					continue
				}
				await guild.members.unban(c.userId).catch(() => null)
				await drizzle
					.update(modCase)
					.set({ resolvedAt: now })
					.where(and(eq(modCase.guildId, c.guildId), eq(modCase.caseNumber, c.caseNumber)))
			} catch (error) {
				this.container.logger.error(
					`Ban expiry failed for ${c.userId} in ${c.guildId}: ${error instanceof Error ? error.message : String(error)}`,
				)
			}
		}
	}
}

import { type Context, Task } from "@sleepymaid/handler"
import { ActivityType } from "discord-api-types/v10"
import { SleepyMaidClient } from "../lib/SleepyMaidClient"

export default class BannerTask extends Task<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			interval: "0 * * * *",
			runOnStart: true,
		})
	}

	public override async execute() {
		const client = this.container.client
		client.logger.debug("Status task started")
		if (!client.user) return
		await client.guilds.fetch()
		const serverCount = client.guilds.cache.size
		client.user.setPresence({
			status: "online",
			activities: [
				{
					name: `${serverCount} servers`,
					type: ActivityType.Custom,
				},
			],
		})
	}
}

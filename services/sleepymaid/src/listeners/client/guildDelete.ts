import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { Guild } from "discord.js"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class extends Listener<"guildDelete", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildDelete",
			once: false,
		})
	}

	public override async execute(guild: Guild) {
		this.container.client.logger.info(`Left guild ${guild.name} (${guild.id})`)
	}
}

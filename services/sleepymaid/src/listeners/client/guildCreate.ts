import { guildsSettings } from "@sleepymaid/db";
import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { Guild } from "discord.js";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class GuildCreateListener extends Listener<"guildCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildCreate",
			once: false,
		});
	}

	public override async execute(guild: Guild) {
		return this.container.client.drizzle
			.insert(guildsSettings)
			.values({ guildId: guild.id, guildName: guild.name, guildIcon: guild.iconURL() });
	}
}

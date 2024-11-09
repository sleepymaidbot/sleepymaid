import { guildSettings } from "@sleepymaid/db";
import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { Guild } from "discord.js";
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient";

export default class GuildCreateListener extends Listener<"guildCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildCreate",
			once: false,
		});
	}

	public override async execute(guild: Guild) {
		this.container.client.logger.info(
			`Joined guild ${guild.name} (${guild.id}) (${guild.memberCount} members) owned by ${guild.ownerId}`,
		);

		return this.container.client.drizzle
			.insert(guildSettings)
			.values({ guildId: guild.id, guildName: guild.name, guildIcon: guild.iconURL() });
	}
}

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

		await guild.members.fetch();
		if (guild.members.cache.size < 50) {
			return;
		}

		const owner = await this.container.client.users.fetch(guild.ownerId);
		if (owner.bot) return guild.leave();

		const botCount = guild.members.cache.filter((member) => member.user.bot).size;
		const nonBotCount = guild.members.cache.filter((member) => !member.user.bot).size;
		if (botCount > nonBotCount) {
			this.container.logger.info(
				`${guild.name} has a bot count of ${botCount} and a non-bot count of ${nonBotCount}. This is a farm.`,
			);
			return await guild.leave();
		}

		return this.container.client.drizzle
			.insert(guildSettings)
			.values({ guildId: guild.id, guildName: guild.name, iconHash: guild.icon });
	}
}

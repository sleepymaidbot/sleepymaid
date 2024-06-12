import { Listener, type Context } from "@sleepymaid/handler";
import type { Guild } from "discord.js";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class AntiFarmJoinListener extends Listener<"guildCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildCreate",
			once: false,
		});
	}

	public override async execute(guild: Guild) {
		await guild.members.fetch();
		if (guild.members.cache.size < 50) {
			return;
		}

		const botCount = guild.members.cache.filter((member) => member.user.bot).size;
		const nonBotCount = guild.members.cache.filter((member) => !member.user.bot).size;
		if (botCount > nonBotCount) {
			this.container.logger.info(
				`${guild.name} has a bot count of ${botCount} and a non-bot count of ${nonBotCount}. This is a farm.`,
			);
			await guild.leave();
		}
	}
}

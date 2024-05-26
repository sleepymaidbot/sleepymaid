import type { ListenerInterface } from "@sleepymaid/handler";
import type { Guild } from "discord.js";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class AntiFarmJoinListener implements ListenerInterface {
	public readonly name = "guildCreate";

	public readonly once = false;

	public async execute(guild: Guild, client: SleepyMaidClient) {
		await guild.members.fetch();
		if (guild.members.cache.size < 50) {
			return;
		}

		const botCount = guild.members.cache.filter((member) => member.user.bot).size;
		const nonBotCount = guild.members.cache.filter((member) => !member.user.bot).size;
		if (botCount > nonBotCount) {
			client.logger.info(
				`${guild.name} has a bot count of ${botCount} and a non-bot count of ${nonBotCount}. This is a farm.`,
			);
			await guild.leave();
		}
	}
}

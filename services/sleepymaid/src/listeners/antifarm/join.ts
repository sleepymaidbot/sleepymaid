import type { ListenerInterface } from "@sleepymaid/handler";
import type { Guild } from "discord.js";

export default class AntiFarmJoinListener implements ListenerInterface {
	public readonly name = "guildCreate";

	public readonly once = false;

	public async execute(guild: Guild) {
		await guild.members.fetch();
		if (guild.members.cache.size < 50) {
			return;
		}

		const botCount = guild.members.cache.filter((member) => member.user.bot).size;
		const nonBotCount = guild.members.cache.filter((member) => !member.user.bot).size;
		if (botCount > nonBotCount) {
			await guild.leave();
		}
	}
}

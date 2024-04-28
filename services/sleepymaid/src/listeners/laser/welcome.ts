import type { ListenerInterface } from "@sleepymaid/handler";
import type { GuildMember } from "discord.js";

export default class WelcomeListener implements ListenerInterface {
	public readonly name = "guildMemberAdd";
	public readonly once = false;

	public async execute(member: GuildMember) {
		if (member.guild.id !== "860721584373497887") return;
		const role = member.guild.roles.cache.get("872029952046927922");
		if (!role) return;
		await member.roles.add(role);
	}
}

import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { GuildMember } from "discord.js"
import type { HelperClient } from "../../lib/extensions/HelperClient"

export default class WelcomeListener extends Listener<"guildMemberAdd", HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			name: "guildMemberAdd",
			once: false,
		})
	}

	public override async execute(member: GuildMember) {
		if (member.guild.id !== "1131653884377579651") return
		const role = member.guild.roles.cache.get("1131656791118336071")
		if (!role) return
		await member.roles.add(role)
	}
}

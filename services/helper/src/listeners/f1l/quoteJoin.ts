import { Context, Listener } from "@sleepymaid/handler";
import { HelperClient } from "../../lib/extensions/HelperClient";
import { GuildMember } from "discord.js";

export default class extends Listener<"guildMemberAdd", HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			name: "guildMemberAdd",
			once: false,
		});
	}

	public override async execute(member: GuildMember) {
		if (member.guild.id !== "796534493535928320") return;
		if (!member.user.bot) return;
		if (member.user.id !== "949479338275913799") return;

		await member.kick("No");
	}
}

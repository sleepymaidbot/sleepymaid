import { autoRoles } from "@sleepymaid/db";
import { Context, Listener } from "@sleepymaid/handler";
import { GuildMember } from "discord.js";
import { eq } from "drizzle-orm";
import { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class MemberJoinListener extends Listener<"guildMemberAdd", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildMemberAdd",
		});
	}

	public override async execute(member: GuildMember) {
		const roles = await this.container.drizzle.query.autoRoles.findMany({
			where: eq(autoRoles.guildId, member.guild.id),
		});
		for (const role of roles) {
			await member.roles.add(role.roleId);
		}
	}
}

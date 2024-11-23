import { Context, Listener } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { GuildMember, Snowflake } from "discord.js";
import { roleConnections } from "@sleepymaid/db";
import { eq } from "drizzle-orm";

export default class extends Listener<"guildMemberUpdate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildMemberUpdate",
			once: false,
		});
	}

	public override async execute(oldMember: GuildMember, newMember: GuildMember) {
		if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

		const guildConnections = await this.container.drizzle.query.roleConnections.findMany({
			where: eq(roleConnections.guildId, newMember.guild.id),
		});

		if (guildConnections.length === 0) return;

		const connections: Record<Snowflake, Snowflake[]> = {};

		for (const connection of guildConnections) {
			connections[connection.parentRoleId] ??= [];
			connections[connection.parentRoleId]?.push(connection.childRoleId);
		}

		for (const [parentRoleId, childRoleIds] of Object.entries(connections)) {
			if (childRoleIds.some((id) => newMember.roles.cache.has(id))) newMember.roles.add(parentRoleId);
			else newMember.roles.remove(parentRoleId);
		}
	}
}

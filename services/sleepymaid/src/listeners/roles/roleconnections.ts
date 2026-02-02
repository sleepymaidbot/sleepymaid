import { roleConnections } from "@sleepymaid/db"
import { Context, Listener } from "@sleepymaid/handler"
import { GuildMember, Snowflake } from "discord.js"
import { eq } from "drizzle-orm"
import { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class extends Listener<"guildMemberUpdate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "guildMemberUpdate",
			once: false,
		})
	}

	public override async execute(oldMember: GuildMember, newMember: GuildMember) {
		if (oldMember.roles.cache.size === newMember.roles.cache.size) return

		const guildConnections = await this.container.drizzle.query.roleConnections.findMany({
			where: eq(roleConnections.guildId, newMember.guild.id),
		})

		if (guildConnections.length === 0) return

		this.container.logger.debug(
			`Processing ${guildConnections.length} role connections for guild ${newMember.guild.id} on member ${newMember.user.username} (${newMember.id})`,
		)

		const connections: Record<Snowflake, Snowflake[]> = {}

		for (const connection of guildConnections) {
			connections[connection.parentRoleId] ??= []
			connections[connection.parentRoleId]?.push(connection.childRoleId)
		}

		for (const [parentRoleId, childRoleIds] of Object.entries(connections)) {
			if (childRoleIds.some((id) => newMember.roles.cache.has(id))) newMember.roles.add(parentRoleId)
			else newMember.roles.remove(parentRoleId)
		}
	}
}

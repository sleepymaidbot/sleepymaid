import { Listener } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { Context } from "@sleepymaid/handler";
import { eq } from "drizzle-orm";
import { Role } from "discord.js";
import { autoRoles, roleConnections, rolePermissions } from "@sleepymaid/db";

export default class extends Listener<"roleDelete", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "roleDelete",
			once: false,
		});
	}

	public override async execute(role: Role) {
		await this.container.drizzle.transaction(async (tx) => {
			// Role permissions
			await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, role.id));

			// Auto roles
			await tx.delete(autoRoles).where(eq(autoRoles.roleId, role.id));

			// Connections
			await tx.delete(roleConnections).where(eq(roleConnections.childRoleId, role.id));
			await tx.delete(roleConnections).where(eq(roleConnections.parentRoleId, role.id));
		});
	}
}

import { DrizzleInstance, rolePermissions, userData } from "@sleepymaid/db";
import { SleepyMaidClient } from "./SleepyMaidClient";
import { and, eq, sql } from "drizzle-orm";
import { permissionKeys } from "@sleepymaid/shared";
import { GuildMember } from "discord.js";

export default class Manager {
	private declare client: SleepyMaidClient;

	private declare drizzle: DrizzleInstance;

	constructor(client: SleepyMaidClient) {
		this.client = client;
		this.drizzle = client.drizzle;
	}

	/*
		Permissions
	*/

	public async permissionQuery(
		member: GuildMember,
		permission: keyof typeof permissionKeys,
		value: boolean,
	): Promise<boolean> {
		const guildId = member.guild.id;
		const permissions = await this.drizzle.query.rolePermissions.findMany({
			where: and(
				eq(rolePermissions.guildId, guildId),
				eq(rolePermissions.permission, permission),
				eq(rolePermissions.value, value),
			),
		});

		return permissions.some((p) => member.roles.cache.has(p.roleId));
	}

	/*
		Balance
	*/

	public formatNumber(number: number): string {
		return new Intl.NumberFormat("en-US", { useGrouping: true }).format(number);
	}

	public async addBalance(userId: string, amount: number, extra?: Partial<typeof userData.$inferInsert>) {
		return await this.drizzle
			.update(userData)
			.set({
				currency: sql`${userData.currency} + ${amount}`,
				...extra,
			})
			.where(eq(userData.userId, userId))
			.returning();
	}

	public async removeBalance(userId: string, amount: number, extra?: Partial<typeof userData.$inferInsert>) {
		return await this.drizzle
			.update(userData)
			.set({
				currency: sql`${userData.currency} - ${amount}`,
				...extra,
			})
			.where(eq(userData.userId, userId))
			.returning();
	}

	public async modifyBalance(
		userId: string,
		amount: number,
		operation: "add" | "remove",
		extra?: Partial<typeof userData.$inferInsert>,
	) {
		if (operation === "add") return await this.addBalance(userId, amount, extra);
		else return await this.removeBalance(userId, amount, extra);
	}
}

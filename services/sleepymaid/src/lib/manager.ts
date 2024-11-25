import { DrizzleInstance, reminders, rolePermissions, userData } from "@sleepymaid/db";
import { SleepyMaidClient } from "./SleepyMaidClient";
import { and, eq, sql } from "drizzle-orm";
import { Permission, permissionList } from "@sleepymaid/shared";
import { GuildMember, PermissionFlagsBits } from "discord.js";
import { downloadVideo } from "./downloader";

export default class Manager {
	private declare client: SleepyMaidClient;

	private declare drizzle: DrizzleInstance;

	constructor(client: SleepyMaidClient) {
		this.client = client;
		this.drizzle = client.drizzle;
	}

	/*
		Downloader
	*/

	public async downloadVideo(url: string, callback: (fileName: string) => Promise<void>) {
		return downloadVideo(this.client, url, callback);
	}

	/*
		Permissions
	*/

	public async permissionQuery(member: GuildMember, permission: Permission, value: boolean = true): Promise<boolean> {
		if (member.permissions.has([PermissionFlagsBits.Administrator])) return value;

		if (!permissionList[permission]) return false;

		const guildId = member.guild.id;
		const permissions = await this.drizzle.query.rolePermissions.findMany({
			where: and(
				eq(rolePermissions.guildId, guildId),
				eq(rolePermissions.permission, permission),
				eq(rolePermissions.value, value),
			),
		});

		if (permissions.length === 0) return permissionList[permission].default;

		return permissions.some((p) => member.roles.cache.has(p.roleId));
	}

	/*
		Balance
	*/

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

	/*
		Reminders
	*/

	public async getReminders(userId: string) {
		return await this.drizzle.query.reminders.findMany({ where: eq(reminders.userId, userId) });
	}

	public async addReminder(userId: string, name: string, time: Date) {
		return await this.drizzle.insert(reminders).values({ userId, reminderName: name, reminderTime: time });
	}

	public async removeReminder(userId: string, id: number) {
		return await this.drizzle.delete(reminders).where(and(eq(reminders.userId, userId), eq(reminders.reminderId, id)));
	}

	public async clearReminders(userId: string) {
		return await this.drizzle.delete(reminders).where(eq(reminders.userId, userId));
	}
}

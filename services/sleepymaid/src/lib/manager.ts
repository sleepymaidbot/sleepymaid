import { DrizzleInstance, reminders, rolePermissions, userData } from "@sleepymaid/db";
import { SleepyMaidClient } from "./SleepyMaidClient";
import { and, eq, sql } from "drizzle-orm";
import { Permission, permissionList } from "@sleepymaid/shared";
import { GuildMember, PermissionFlagsBits } from "discord.js";
import { downloadVideo } from "./downloader";
import { Logger } from "@sleepymaid/logger";

const MetadataCoolDown = new Map<string, number>();

export default class Manager {
	declare private client: SleepyMaidClient;

	declare private drizzle: DrizzleInstance;

	declare private logger: Logger;

	constructor(client: SleepyMaidClient) {
		this.client = client;
		this.drizzle = client.drizzle;
		this.logger = client.logger;
	}

	/*
		Downloader
	*/

	public async downloadVideo(url: string) {
		return downloadVideo(this.client, url);
	}

	/*
		Linked Roles
	*/

	public async updateUserMetadata(userId: string) {
		this.logger.debug(`Trying to update user metadata for ${userId}`);
		if (MetadataCoolDown.has(userId)) {
			if (MetadataCoolDown.get(userId)! > Date.now()) return;
		}

		MetadataCoolDown.set(userId, Date.now() + 1000 * 60 * 10);

		this.logger.debug(`Updating user metadata for ${userId}`);

		const apiUrl = process.env.API_URL ?? "https://api.ecorte.xyz";
		const apiKey = process.env.API_SECRET ?? "";
		const data = await fetch(`${apiUrl}/update-metadata?userId=${userId}`, {
			method: "POST",
			headers: {
				Authorization: apiKey,
			},
		}).catch((err) => {
			this.logger.error(`Failed to update user metadata for ${userId}: ${err}`);
			return null;
		});

		if (!data) return;

		this.logger.info(`Updated user metadata for ${userId}`);

		return data.json();
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

import { DrizzleInstance, userData } from "@sleepymaid/db";
import { SleepyMaidClient } from "./extensions/SleepyMaidClient";
import { eq, sql } from "drizzle-orm";

export default class Manager {
	private declare client: SleepyMaidClient;

	private declare drizzle: DrizzleInstance;

	constructor(client: SleepyMaidClient) {
		this.client = client;
		this.drizzle = client.drizzle;
	}

	public async addBalance(
		userId: string,
		amount: number,
		extra?: Partial<typeof userData.$inferInsert>,
	): Promise<void> {
		await this.drizzle
			.update(userData)
			.set({
				currency: sql`${userData.currency} + ${amount}`,
				...extra,
			})
			.where(eq(userData.userId, userId));
	}

	public async removeBalance(
		userId: string,
		amount: number,
		extra?: Partial<typeof userData.$inferInsert>,
	): Promise<void> {
		await this.drizzle
			.update(userData)
			.set({
				currency: sql`${userData.currency} - ${amount}`,
				...extra,
			})
			.where(eq(userData.userId, userId));
	}

	public async modifyBalance(
		userId: string,
		amount: number,
		operation: "add" | "remove",
		extra?: Partial<typeof userData.$inferInsert>,
	): Promise<void> {
		if (operation === "add") await this.addBalance(userId, amount, extra);
		else await this.removeBalance(userId, amount, extra);
	}
}

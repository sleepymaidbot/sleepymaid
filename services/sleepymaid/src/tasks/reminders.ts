import { Context, Task } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../lib/SleepyMaidClient";
import { eq } from "drizzle-orm";
import { lte } from "drizzle-orm";
import { reminders, Reminder } from "@sleepymaid/db";

export default class RemindersTask extends Task<SleepyMaidClient> {
	private dbCooldown = 0;
	private cachedReminders: Reminder[] = [];
	private readonly CACHE_REFRESH_INTERVAL = 300_000; // 5 min

	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			interval: "* * * * *",
			runOnStart: true,
		});
	}

	private async refreshCache() {
		if (Date.now() - this.dbCooldown < this.CACHE_REFRESH_INTERVAL) return;

		this.container.logger.debug("Refreshing reminders cache");
		this.cachedReminders = await this.container.drizzle.query.reminders.findMany({
			where: lte(reminders.reminderTime, new Date(Date.now() + 360_000)), // 6 min
		});
		this.dbCooldown = Date.now();
	}

	public override async execute() {
		this.container.logger.debug("Reminders task started");

		await this.refreshCache();

		const now = Date.now();
		const dueReminders = this.cachedReminders.filter((reminder) => reminder.reminderTime.getTime() <= now - 1000);

		if (dueReminders.length === 0) return;

		for (const reminder of dueReminders) {
			this.container.logger.info(`Processing reminder: ${reminder.reminderId}`);
			const user = await this.container.client.users.fetch(reminder.userId);
			if (!user) continue;

			await user.send({ content: `Reminder: ${reminder.reminderName}` });

			await this.container.drizzle.delete(reminders).where(eq(reminders.reminderId, reminder.reminderId));
			this.cachedReminders = this.cachedReminders.filter((r) => r.reminderId !== reminder.reminderId);
		}
	}
}

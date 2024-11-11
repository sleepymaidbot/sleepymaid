import { Context, Task } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../lib/SleepyMaidClient";
import { eq } from "drizzle-orm";
import { lte } from "drizzle-orm";
import { reminders } from "@sleepymaid/db";

export default class RemindersTask extends Task<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			interval: "*/5 * * * *",
			runOnStart: true,
		});
	}

	public override async execute() {
		this.container.logger.debug("Reminders task started");

		const remindersList = await this.container.drizzle.query.reminders.findMany({
			where: lte(reminders.reminderTime, new Date()),
		});

		for (const reminder of remindersList) {
			this.container.logger.info(`Processing reminder: ${reminder.reminderId}`);
			const user = await this.container.client.users.fetch(reminder.userId);
			if (!user) continue;

			await user.send({ content: reminder.reminderName });

			await this.container.drizzle.delete(reminders).where(eq(reminders.reminderId, reminder.reminderId));
		}
	}
}

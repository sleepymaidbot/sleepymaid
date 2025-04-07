import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { Interaction } from "discord.js";
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { MessageFlags } from "discord-api-types/v10";
import { getUnixTime } from "date-fns";
import { isBefore } from "date-fns";
import { add } from "date-fns";

const cleanNames: Record<string, string> = {
	daily: "Daily Reward",
	weekly: "Weekly Reward",
	monthly: "Monthly Reward",
};

export default class extends Listener<"interactionCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "interactionCreate",
			once: false,
		});
	}

	public override async execute(interaction: Interaction) {
		if (!interaction.isButton()) return;
		if (interaction.customId.startsWith("reminder:in:")) {
			const [_, __, time, name, ownerId] = interaction.customId.split(":");
			const userId = interaction.user.id;
			if (ownerId !== userId)
				return interaction.reply({
					content: "You don't have permission to use this button",
					flags: MessageFlags.Ephemeral,
				});
			if (!time) return await interaction.reply({ content: "Invalid time", flags: MessageFlags.Ephemeral });
			let reminderName = "reminder";
			if (name && cleanNames[name]) reminderName = cleanNames[name];

			const now = new Date();
			const date = add(now, {
				minutes: parseInt(time),
			});
			if (isBefore(date, now)) {
				return interaction.reply({
					content: "You must specify a time in the future",
					flags: MessageFlags.Ephemeral,
				});
			}

			await this.container.manager.addReminder(interaction.user.id, reminderName, date);

			const timestamp = getUnixTime(date);

			await interaction.reply({
				content: `Reminder added for \`\`${reminderName}\`\` <t:${timestamp}:R>`,
				flags: MessageFlags.Ephemeral,
			});

			await interaction.message.edit({
				components: [],
			});
		}
		return;
	}
}

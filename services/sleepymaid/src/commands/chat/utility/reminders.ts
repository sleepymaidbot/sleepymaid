import { Context, SlashCommand } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient";
import { ApplicationCommandOptionType, AutocompleteInteraction, ChatInputCommandInteraction } from "discord.js";
import DBCheckPrecondtion from "../../../preconditions/dbCheck";
import { getAutocompleteResults } from "@sleepymaid/shared";
import { add, getUnixTime } from "date-fns";

export default class Reminders extends SlashCommand<SleepyMaidClient> {
	constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			preconditions: [DBCheckPrecondtion],
			data: {
				name: "reminder",
				description: "Base reminder command",
				options: [
					{
						name: "add",
						description: "Add a reminder",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "message",
								description: "The message to remind you with",
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								name: "days",
								description: "The number of days to wait before reminding you",
								type: ApplicationCommandOptionType.Integer,
								required: false,
							},
							{
								name: "hours",
								description: "The number of hours to wait before reminding you",
								type: ApplicationCommandOptionType.Integer,
								required: false,
							},
							{
								name: "minutes",
								description: "The number of minutes to wait before reminding you",
								type: ApplicationCommandOptionType.Integer,
								required: false,
							},
						],
					},
					{
						name: "remove",
						description: "Remove a reminder",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "id",
								description: "The id of the reminder to remove",
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
						],
					},
					{
						name: "list",
						description: "List your reminders",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "clear",
						description: "Clear all your reminders",
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case "add":
				return this.add(interaction);
			case "remove":
				return this.remove(interaction);
			case "list":
				return this.list(interaction);
			case "clear":
				return this.clear(interaction);
			default:
				return interaction.reply({ content: "Invalid subcommand", ephemeral: true });
		}
	}

	private async add(interaction: ChatInputCommandInteraction) {
		const message = interaction.options.getString("message", true);

		const reminders = await this.container.manager.getReminders(interaction.user.id);

		if (reminders.length >= 10) {
			return interaction.reply({
				content: "You have too many reminders, please remove some before adding more",
				ephemeral: true,
			});
		}

		const days = interaction.options.getInteger("days") ?? 0;
		const hours = interaction.options.getInteger("hours") ?? 0;
		const minutes = interaction.options.getInteger("minutes") ?? 0;
		if (days + hours + minutes === 0) {
			return interaction.reply({
				content: "You must specify a time to wait before reminding you",
				ephemeral: true,
			});
		}
		const date = add(new Date(), { days, hours, minutes });

		await this.container.manager.addReminder(interaction.user.id, message, date);

		const timestamp = getUnixTime(date);

		return await interaction.reply({
			content: `Reminder added for \`\`${message}\`\` <t:${timestamp}:R>`,
			ephemeral: true,
		});
	}

	private async remove(interaction: ChatInputCommandInteraction) {
		const id = interaction.options.getString("id", true);

		await this.container.manager.removeReminder(interaction.user.id, parseInt(id));

		return await interaction.reply({ content: "Reminder removed", ephemeral: true });
	}

	private async list(interaction: ChatInputCommandInteraction) {
		const reminders = await this.container.manager.getReminders(interaction.user.id);

		return await interaction.reply({
			content: `You have ${reminders.length} reminders:\n${reminders
				.map(
					(reminder) =>
						`**${reminder.reminderName}** (ID: ${reminder.reminderId}) <t:${getUnixTime(reminder.reminderTime)}:R>`,
				)
				.join("\n")}`,
			ephemeral: true,
		});
	}

	private async clear(interaction: ChatInputCommandInteraction) {
		await this.container.manager.clearReminders(interaction.user.id);

		return await interaction.reply({ content: "All your reminders have been cleared", ephemeral: true });
	}

	public override async autocomplete(interaction: AutocompleteInteraction) {
		const focusedValue = interaction.options.getFocused();

		const reminders = await this.container.manager.getReminders(interaction.user.id);

		const choices = reminders.map((reminder) => ({
			value: reminder.reminderId.toString(),
			name: reminder.reminderName,
		}));

		await interaction.respond(getAutocompleteResults(choices, focusedValue));
	}
}

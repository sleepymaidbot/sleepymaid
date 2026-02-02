import { reminders } from "@sleepymaid/db"
import { Context, SlashCommand } from "@sleepymaid/handler"
import { getAutocompleteResults } from "@sleepymaid/shared"
import { getTimeTable } from "@sleepymaid/util"
import { add, getUnixTime, isBefore } from "date-fns"
import {
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	InteractionContextType,
	MessageFlags,
} from "discord.js"
import { and, eq } from "drizzle-orm"
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient"
import DBCheckPrecondtion from "../../../preconditions/dbCheck"

export default class Reminders extends SlashCommand<SleepyMaidClient> {
	constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			preconditions: [DBCheckPrecondtion],
			data: {
				name: "reminder",
				description: "Base reminder command",
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
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
								name: "time",
								description: "The time to wait before reminding you",
								type: ApplicationCommandOptionType.String,
								required: true,
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
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case "add":
				return this.add(interaction)
			case "remove":
				return this.remove(interaction)
			case "list":
				return this.list(interaction)
			case "clear":
				return this.clear(interaction)
			default:
				return interaction.reply({ content: "Invalid subcommand", flags: MessageFlags.Ephemeral })
		}
	}

	private async add(interaction: ChatInputCommandInteraction) {
		const message = interaction.options.getString("message", true)

		const reminders = await this.container.manager.getReminders(interaction.user.id)

		if (reminders.length >= 10) {
			return interaction.reply({
				content: "You have too many reminders, please remove some before adding more",
				flags: MessageFlags.Ephemeral,
			})
		}

		const time = interaction.options.getString("time", true)
		const now = new Date()
		const date = add(now, getTimeTable(time))
		if (isBefore(date, now)) {
			return interaction.reply({
				content: "You must specify a time in the future",
				flags: MessageFlags.Ephemeral,
			})
		}

		await this.container.manager.addReminder(interaction.user.id, message, date)

		const timestamp = getUnixTime(date)

		return await interaction.reply({
			content: `Reminder added for \`\`${message}\`\` <t:${timestamp}:R>`,
			flags: MessageFlags.Ephemeral,
		})
	}

	private async remove(interaction: ChatInputCommandInteraction) {
		const id = interaction.options.getString("id", true)

		await this.container.manager.removeReminder(interaction.user.id, parseInt(id))

		const reminder = await this.container.drizzle.query.reminders.findFirst({
			where: and(eq(reminders.reminderId, parseInt(id)), eq(reminders.userId, interaction.user.id)),
		})

		if (!reminder) {
			return await interaction.reply({ content: "Reminder not found", flags: MessageFlags.Ephemeral })
		}

		if (reminder.userId !== interaction.user.id) {
			return await interaction.reply({
				content: "You don't have permission to remove this reminder",
				flags: MessageFlags.Ephemeral,
			})
		}

		return await interaction.reply({ content: "Reminder removed", flags: MessageFlags.Ephemeral })
	}

	private async list(interaction: ChatInputCommandInteraction) {
		const reminders = await this.container.manager.getReminders(interaction.user.id)

		return await interaction.reply({
			content: `You have ${reminders.length} reminders:\n${reminders
				.map(
					(reminder) =>
						`**${reminder.reminderName}** (ID: ${reminder.reminderId}) <t:${getUnixTime(reminder.reminderTime)}:R>`,
				)
				.join("\n")}`,
			flags: MessageFlags.Ephemeral,
		})
	}

	private async clear(interaction: ChatInputCommandInteraction) {
		await this.container.manager.clearReminders(interaction.user.id)

		return await interaction.reply({ content: "All your reminders have been cleared", flags: MessageFlags.Ephemeral })
	}

	public override async autocomplete(interaction: AutocompleteInteraction) {
		const focusedValue = interaction.options.getFocused()

		const reminders = await this.container.manager.getReminders(interaction.user.id)

		const choices = reminders.map((reminder) => ({
			value: reminder.reminderId.toString(),
			name: reminder.reminderName,
		}))

		await interaction.respond(getAutocompleteResults(choices, focusedValue))
	}
}

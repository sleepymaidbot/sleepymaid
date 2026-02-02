import { guildSettings, logChannel, types } from "@sleepymaid/db"
import { Context, SlashCommand } from "@sleepymaid/handler"
import { AutocompleteChoices, getAutocompleteResults } from "@sleepymaid/shared"
import {
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	AutocompleteInteraction,
	ButtonStyle,
	ChannelType,
	ChatInputCommandInteraction,
	ComponentType,
	InteractionContextType,
	MessageComponentInteraction,
	MessageFlags,
	PermissionFlagsBits,
} from "discord.js"
import { and, eq } from "drizzle-orm"
import { WatcherClient } from "../../lib/extensions/WatcherClient"

const options: AutocompleteChoices = []

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "logchannel",
				description: "Base log command",
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				contexts: [InteractionContextType.Guild],
				defaultMemberPermissions: PermissionFlagsBits.ManageGuild,
				options: [
					{
						name: "create",
						description: "Create a log channel",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "channel",
								description: "The channel to send the log to",
								type: ApplicationCommandOptionType.Channel,
								channelTypes: [ChannelType.GuildText],
							},
							{
								name: "thread",
								description: "The thread to send the log to",
								type: ApplicationCommandOptionType.Channel,
								channelTypes: [ChannelType.PublicThread],
							},
						],
					},
					{
						name: "delete",
						description: "Delete a log channel",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "channel",
								description: "The channel to delete",
								type: ApplicationCommandOptionType.Channel,
								channelTypes: [ChannelType.GuildText],
							},
							{
								name: "thread",
								description: "The thread to delete",
								type: ApplicationCommandOptionType.Channel,
								channelTypes: [ChannelType.PublicThread],
							},
						],
					},
					{
						name: "list",
						description: "List all log channels",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "clear",
						description: "Clear all log channels",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "types",
						description: "Set the type of logs to send in a channel",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "type",
								description: "The type of logs to send",
								type: ApplicationCommandOptionType.String,
								required: true,
								autocomplete: true,
							},
							{
								name: "enabled",
								description: "Whether the type of logs is enabled",
								type: ApplicationCommandOptionType.Boolean,
								required: true,
							},
							{
								name: "channel",
								description: "The channel to set the types for",
								type: ApplicationCommandOptionType.Channel,
								channelTypes: [ChannelType.GuildText],
								required: false,
							},
							{
								name: "thread",
								description: "The thread to set the types for",
								type: ApplicationCommandOptionType.Channel,
								channelTypes: [ChannelType.PublicThread],
								required: false,
							},
						],
					},
					{
						name: "info",
						description: "Get information about a log channel",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "id",
								description: "The id of the log channel",
								type: ApplicationCommandOptionType.String,
								required: true,
							},
						],
					},
				],
			},
		})
	}

	public override execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return

		const subcommand = interaction.options.getSubcommand()

		switch (subcommand) {
			case "create":
				return this.create(interaction)
			case "delete":
				return this.delete(interaction)
			case "list":
				return this.list(interaction)
			case "clear":
				return this.clear(interaction)
			case "types":
				return this.types(interaction)
			case "info":
				return this.info(interaction)
			default:
				return interaction.reply({ content: "Invalid subcommand", flags: MessageFlags.Ephemeral })
		}
	}

	private async create(interaction: ChatInputCommandInteraction<"cached">) {
		const channel = interaction.options.getChannel("channel") ?? interaction.channel
		const thread = interaction.options.getChannel("thread")

		if (!channel || !channel.isTextBased() || !("createWebhook" in channel))
			return interaction.reply({ content: "Channel not found", flags: MessageFlags.Ephemeral })

		const existingChannel = await this.container.client.drizzle.query.logChannel.findMany({
			where: eq(logChannel.guildId, interaction.guild.id),
		})

		const guildSetting = await this.container.client.drizzle.query.guildSettings.findFirst({
			where: eq(guildSettings.guildId, interaction.guild.id),
		})

		if (!guildSetting) return interaction.reply({ content: "Guild settings not found", flags: MessageFlags.Ephemeral })

		if (existingChannel.length >= 3 && guildSetting.premiumLevel <= 1)
			return interaction.reply({
				content: "You have reached the maximum number of log channels",
				flags: MessageFlags.Ephemeral,
			})

		if (
			existingChannel.some((c) => {
				if (c.channelId === channel.id) return true
				if (c.threadId === thread?.id) return true
				return false
			})
		)
			return interaction.reply({ content: "Channel already has is a log channel", flags: MessageFlags.Ephemeral })

		const webhook = await channel
			.createWebhook({
				name: `Watcher Logs`,
				avatar: this.container.client.user!.displayAvatarURL() ?? "",
				reason: `New log channel created by ${interaction.user.tag}`,
			})
			.catch(() => null)

		if (!webhook) return interaction.reply({ content: "Failed to create webhook", flags: MessageFlags.Ephemeral })

		const [returning] = await this.container.client.drizzle
			.insert(logChannel)
			.values({
				guildId: interaction.guild.id,
				channelId: channel.id,
				webhookId: webhook.id,
				webhookToken: webhook.token ?? "",
				threadId: thread ? thread.id : null,
			})
			.returning()

		return interaction.reply({
			content: `Log channel created successfully. ID: \`\`${returning?.id}\`\``,
			flags: MessageFlags.Ephemeral,
		})
	}

	private async delete(interaction: ChatInputCommandInteraction<"cached">) {
		const channel = interaction.options.getChannel("channel") ?? interaction.channel
		const thread = interaction.options.getChannel("thread")

		if (!channel || !channel.isTextBased())
			return interaction.reply({ content: "Channel not found", flags: MessageFlags.Ephemeral })

		if (thread) {
			await this.container.client.drizzle
				.delete(logChannel)
				.where(and(eq(logChannel.guildId, interaction.guild.id), eq(logChannel.threadId, thread.id)))
		} else {
			await this.container.client.drizzle.delete(logChannel).where(eq(logChannel.channelId, channel.id))
		}

		return interaction.reply({ content: "Log channel deleted successfully", flags: MessageFlags.Ephemeral })
	}

	private async list(interaction: ChatInputCommandInteraction<"cached">) {
		const channels = await this.container.client.drizzle.query.logChannel.findMany({
			where: eq(logChannel.guildId, interaction.guild.id),
		})

		return interaction.reply({
			content: `**Log Channels**\n${channels.map((c) => `\`\`${c.id}\`\` <#${c.channelId}>`).join("\n")}`,
			flags: MessageFlags.Ephemeral,
		})
	}

	private async clear(interaction: ChatInputCommandInteraction<"cached">) {
		if (!interaction.channel) return

		await interaction.reply({
			content: "Are you sure you want to clear all log channels?",
			flags: MessageFlags.Ephemeral,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: "Yes",
							style: ButtonStyle.Success,
							customId: "logchannel:clear:confirm",
						},
						{
							type: ComponentType.Button,
							label: "No",
							style: ButtonStyle.Danger,
							customId: "logchannel:clear:cancel",
						},
					],
				},
			],
		})

		interaction.channel
			.createMessageComponentCollector({
				filter: (i: MessageComponentInteraction) => i.customId.startsWith("logchannel:clear:"),
				time: 15000,
			})
			.on("collect", async (i: MessageComponentInteraction) => {
				if (i.user.id !== interaction.user.id) return

				if (i.customId.startsWith("logchannel:clear:confirm")) {
					await this.container.client.drizzle.delete(logChannel).where(eq(logChannel.guildId, interaction.guild.id))

					await interaction.editReply({ content: "Successfully cleared all log channels", components: [] })
					return await i.deferUpdate()
				} else {
					await interaction.editReply({ components: [] })
					return await i.deferUpdate()
				}
			})
			.on("end", () => {
				interaction.editReply({ components: [] })
			})
	}

	private async types(interaction: ChatInputCommandInteraction<"cached">) {
		const chan = interaction.options.getChannel("channel") ?? interaction.channel
		const thread = interaction.options.getChannel("thread")
		const enabled = interaction.options.getBoolean("enabled", true)

		if (!chan) return interaction.reply({ content: "Channel not found", flags: MessageFlags.Ephemeral })

		const conditions = [eq(logChannel.guildId, interaction.guild.id), eq(logChannel.channelId, chan.id)]

		if (thread) conditions.push(eq(logChannel.threadId, thread.id))

		const channel = await this.container.client.drizzle.query.logChannel.findFirst({
			where: and(...conditions),
		})

		if (!channel) return interaction.reply({ content: "Log channel not found", flags: MessageFlags.Ephemeral })

		const type = interaction.options.getString("type", true)

		if (!options.some((o) => o.value === type))
			return interaction.reply({ content: "Invalid type", flags: MessageFlags.Ephemeral })

		if (type === "all") {
			await this.container.client.drizzle
				.update(logChannel)
				.set({
					moderationEvents: {
						timeout: enabled,
						untimeout: enabled,
						kick: enabled,
						ban: enabled,
						unban: enabled,
					},
					memberEvents: {
						join: enabled,
						leave: enabled,
						nicknameChange: enabled,
						roleChange: enabled,
						avatarChange: enabled,
						usernameChange: enabled,
						voiceStateUpdate: enabled,
					},
					messageEvents: {
						edit: enabled,
						delete: enabled,
					},
					roleEvents: {
						create: enabled,
						delete: enabled,
						update: enabled,
					},
					channelEvents: {
						create: enabled,
						delete: enabled,
						update: enabled,
					},
					emojiEvents: {
						create: enabled,
						delete: enabled,
						update: enabled,
					},
					inviteEvents: {
						create: enabled,
						delete: enabled,
					},
				})
				.where(eq(logChannel.id, channel.id))
		} else {
			const [firstType, secondType] = type.split(".")

			if (!firstType || !secondType)
				return interaction.reply({ content: "Invalid type", flags: MessageFlags.Ephemeral })

			await this.container.client.drizzle
				.update(logChannel)
				.set({
					[firstType]: { [secondType]: enabled },
				})
				.where(eq(logChannel.id, channel.id))
		}

		await this.container.manager.updateLogChannels(interaction.guild.id)

		return interaction.reply({ content: "Log channel types updated successfully", flags: MessageFlags.Ephemeral })
	}

	private async info(interaction: ChatInputCommandInteraction<"cached">) {
		const id = interaction.options.getString("id", true)

		const channel = await this.container.client.drizzle.query.logChannel.findFirst({
			where: and(eq(logChannel.guildId, interaction.guild.id), eq(logChannel.id, Number(id))),
		})

		if (!channel) return interaction.reply({ content: "Log channel not found", flags: MessageFlags.Ephemeral })

		const text = []

		for (const [key, value] of Object.entries(types)) {
			const data = channel[key as keyof typeof channel]
			if (!data) continue
			for (const [subkey, subvalue] of Object.entries(value)) {
				const value = data[subkey as keyof typeof data]
				text.push(`**${subvalue}:** ${value ? "Enabled" : "Disabled"}`)
			}
		}

		return interaction.reply({
			content: `**Log Channel Info**\nID: \`\`${channel.id}\`\`\n\n${text.join("\n")}`,
			flags: MessageFlags.Ephemeral,
		})
	}

	public override autocomplete(interaction: AutocompleteInteraction) {
		if (options.length === 0) {
			const op: AutocompleteChoices = []
			for (const [key, value] of Object.entries(types)) {
				for (const [subkey, subvalue] of Object.entries(value)) {
					op.push({ name: subvalue, value: `${key}.${subkey}` })
				}
			}
			op.push({ name: "All", value: "all" })
			options.push(...op)
		}

		const results = getAutocompleteResults(options, interaction.options.getFocused())

		interaction.respond(results)
	}
}

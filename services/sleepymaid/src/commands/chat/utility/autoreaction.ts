import { autoReactions } from "@sleepymaid/db"
import { Context, SlashCommand } from "@sleepymaid/handler"
import { parseEmoji } from "@sleepymaid/shared"
import {
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	ChannelType,
	ChatInputCommandInteraction,
	Colors,
	EmbedBuilder,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
} from "discord.js"
import { and, eq, or } from "drizzle-orm"
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient"
import DBCheckPrecondtion from "../../../preconditions/dbCheck"

export default class extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			preconditions: [DBCheckPrecondtion],
			data: {
				name: "autoreaction",
				description: "Manage automatic reactions to messages in channels",
				defaultMemberPermissions: [PermissionFlagsBits.ManageMessages],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				contexts: [InteractionContextType.Guild],
				options: [
					{
						name: "add",
						description: "Add an auto reaction",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "reaction",
								description: "The emoji to automatically add to new messages",
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								name: "channel",
								description: "The target channel for auto reactions",
								type: ApplicationCommandOptionType.Channel,
								channelTypes: [
									ChannelType.GuildText,
									ChannelType.GuildAnnouncement,
									ChannelType.GuildVoice,
									ChannelType.PublicThread,
									ChannelType.PrivateThread,
								],
								required: true,
							},
						],
					},
					{
						name: "remove",
						description: "Remove an auto reaction",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "channel",
								description: "The channel to remove the auto reaction from",
								type: ApplicationCommandOptionType.Channel,
								required: true,
							},
							{
								name: "reaction",
								description: "The emoji to remove from auto reactions",
								type: ApplicationCommandOptionType.String,
								required: true,
							},
						],
					},
					{
						name: "list",
						description: "List auto reactions in the server or specific channel",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "channel",
								description: "Optional channel to filter auto reactions",
								type: ApplicationCommandOptionType.Channel,
								required: false,
							},
						],
					},
					{
						name: "clear",
						description: "Remove all auto reactions from the server or specific channel",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "channel",
								description: "Optional channel to clear auto reactions from",
								type: ApplicationCommandOptionType.Channel,
								required: false,
							},
						],
					},
				],
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return interaction.reply("This command must be used in a guild")
		const subcommand = interaction.options.getSubcommand()
		switch (subcommand) {
			case "add":
				return await this.add(interaction)
			case "remove":
				return await this.remove(interaction)
			case "list":
				return await this.list(interaction)
			case "clear":
				return await this.clear(interaction)
			default:
				return interaction.reply("Invalid subcommand")
		}
	}

	private async add(interaction: ChatInputCommandInteraction<"cached">) {
		const reactionString = interaction.options.getString("reaction", true)
		const channel = interaction.options.getChannel("channel", true)

		const reaction = parseEmoji(reactionString, "unicode")
		if (!reaction)
			return interaction.reply({
				content: "Reactions must an emoji",
				flags: MessageFlags.Ephemeral,
			})

		const existingReaction = await this.container.drizzle.query.autoReactions.findFirst({
			where: and(
				eq(autoReactions.guildId, interaction.guild.id),
				eq(autoReactions.channelId, channel.id),
				or(
					reaction.type === "custom"
						? eq(autoReactions.reactionId, reaction.id)
						: eq(autoReactions.reactionName, reaction.name),
				),
			),
		})

		if (existingReaction)
			return interaction.reply({
				content: `Auto reaction ${reaction.name} already exists in ${channel}`,
				flags: MessageFlags.Ephemeral,
			})

		await this.container.drizzle.insert(autoReactions).values({
			guildId: interaction.guild.id,
			reactionId: reaction.type === "custom" ? reaction.id : null,
			reactionName: reaction.name,
			channelId: channel.id,
		})

		return interaction.reply({
			content: `New messages in ${channel} will now be automatically reacted to with ${reaction.name}`,
			flags: MessageFlags.Ephemeral,
		})
	}

	private async remove(interaction: ChatInputCommandInteraction<"cached">) {
		const channel = interaction.options.getChannel("channel", true)
		const reactionString = interaction.options.getString("reaction", true)

		const reaction = parseEmoji(reactionString)
		if (!reaction)
			return interaction.reply({
				content: "Reactions must an emoji",
				flags: MessageFlags.Ephemeral,
			})

		const existingReaction = await this.container.drizzle.query.autoReactions.findFirst({
			where: and(
				eq(autoReactions.guildId, interaction.guild.id),
				eq(autoReactions.channelId, channel.id),
				or(
					reaction.type === "custom"
						? eq(autoReactions.reactionId, reaction.id)
						: eq(autoReactions.reactionName, reaction.name),
				),
			),
		})

		if (!existingReaction)
			return interaction.reply({
				content: `Auto reaction ${reaction.name} does not exist in ${channel}`,
				flags: MessageFlags.Ephemeral,
			})

		await this.container.drizzle
			.delete(autoReactions)
			.where(
				and(
					eq(autoReactions.guildId, interaction.guild.id),
					eq(autoReactions.channelId, channel.id),
					or(
						reaction.type === "custom"
							? eq(autoReactions.reactionId, reaction.id)
							: eq(autoReactions.reactionName, reaction.name),
					),
				),
			)

		return interaction.reply({
			content: `Auto reaction ${reaction.name} removed from ${channel}`,
			flags: MessageFlags.Ephemeral,
		})
	}

	private async list(interaction: ChatInputCommandInteraction<"cached">) {
		const channel = interaction.options.getChannel("channel")
		if (channel) {
			const reactions = await this.container.drizzle.query.autoReactions.findMany({
				where: and(eq(autoReactions.guildId, interaction.guild.id), eq(autoReactions.channelId, channel.id)),
			})
			if (reactions.length === 0) {
				return interaction.reply({
					content: `No auto reactions found in ${channel}`,
					flags: MessageFlags.Ephemeral,
				})
			}
			return interaction.reply({
				content: `Auto reactions in ${channel}`,
				flags: MessageFlags.Ephemeral,
				embeds: [
					new EmbedBuilder()
						.setTitle("Auto Reactions")
						.setDescription(
							reactions
								.map(
									(reaction) =>
										`- ${reaction.reactionName} (${reaction.reactionId ? `<:${reaction.reactionName}:${reaction.reactionId}>` : reaction.reactionName})`,
								)
								.join("\n"),
						)
						.setColor(Colors.Green),
				],
			})
		}
		const reactions = await this.container.drizzle.query.autoReactions.findMany({
			where: eq(autoReactions.guildId, interaction.guild.id),
		})

		if (reactions.length === 0) {
			return interaction.reply({
				content: `No auto reactions found in ${interaction.guild.name}`,
				flags: MessageFlags.Ephemeral,
			})
		}

		return interaction.reply({
			content: `Auto reactions in ${interaction.guild.name}`,
			flags: MessageFlags.Ephemeral,
			embeds: [
				new EmbedBuilder()
					.setTitle("Auto Reactions")
					.setDescription(
						reactions
							.map(
								(reaction) =>
									`- ${reaction.reactionName} (${reaction.reactionId ? `<:${reaction.reactionName}:${reaction.reactionId}>` : reaction.reactionName}) in <#${reaction.channelId}>`,
							)
							.join("\n"),
					)
					.setColor(Colors.Green),
			],
		})
	}

	private async clear(interaction: ChatInputCommandInteraction<"cached">) {
		const channel = interaction.options.getChannel("channel")
		if (channel) {
			await this.container.drizzle
				.delete(autoReactions)
				.where(and(eq(autoReactions.guildId, interaction.guild.id), eq(autoReactions.channelId, channel.id)))
			return interaction.reply({
				content: `Auto reactions cleared from ${channel}`,
				flags: MessageFlags.Ephemeral,
			})
		} else {
			await this.container.drizzle.delete(autoReactions).where(eq(autoReactions.guildId, interaction.guild.id))
			return interaction.reply({
				content: `Auto reactions cleared from all channels`,
				flags: MessageFlags.Ephemeral,
			})
		}
	}
}

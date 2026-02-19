import { Context, SlashCommand } from "@sleepymaid/handler"
import {
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	Colors,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
} from "discord.js"
import { createModCase, upsertUserData, validateReason } from "../../../lib/extensions/moderationHelpers"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "warn",
				description: "Warn a user",
				defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
				contexts: [InteractionContextType.Guild],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				options: [
					{
						name: "user",
						description: "The user to warn",
						type: ApplicationCommandOptionType.User,
						required: true,
					},
					{
						name: "reason",
						description: "The reason for the warning",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: "silent",
						description: "Whether to respond with an ephemeral message",
						type: ApplicationCommandOptionType.Boolean,
						required: false,
					},
				],
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) return
		if (!interaction.inCachedGuild()) return
		const member = interaction.options.getMember("user")
		if (!member) return interaction.reply({ content: "User not found.", flags: MessageFlags.Ephemeral })

		let reason: string | null
		try {
			reason = validateReason(interaction.options.getString("reason", true))
		} catch (error) {
			return interaction.reply({
				content: error instanceof Error ? error.message : "Invalid reason provided.",
				flags: MessageFlags.Ephemeral,
			})
		}

		const drizzle = this.container.client.drizzle
		const userId = member.id
		const silent = interaction.options.getBoolean("silent") ?? false

		try {
			const { weight1: moderatorWeight, weight2: targetWeight } = await this.container.manager.compareUserWeight(
				interaction.member,
				member,
			)
			if (moderatorWeight <= targetWeight)
				return interaction.reply({
					content: "You cannot warn this user because they have a higher or equal weight than you.",
					flags: MessageFlags.Ephemeral,
				})

			await upsertUserData(drizzle, userId, member.user.username, member.displayName)

			await interaction.reply({
				content: `✅ ${member} has been warned.`,
			})

			const reply = await interaction.fetchReply()
			const caseNumber = await this.container.manager.getNextCaseNumber(interaction.guild.id)

			await createModCase(
				drizzle,
				interaction.guild.id,
				caseNumber,
				reply.id,
				userId,
				"warn",
				interaction.user.id,
				reason,
			)

			await interaction.editReply({
				content: `✅ ${member} has been warned. Case #${caseNumber}`,
			})

			await this.container.manager.sendModDm(member.user, interaction.guild.name, {
				caseNumber,
				type: "warned",
				reason,
				modTag: interaction.user.tag,
			})

			const channels = await this.container.manager.getLogChannel(interaction.guild.id)
			if (channels?.length) {
				await this.container.manager.sendModLog(channels, {
					embeds: [
						{
							title: `Case #${caseNumber} | Warn`,
							color: Colors.Yellow,
							fields: [
								{ name: "User", value: `${member} (${userId})`, inline: true },
								{ name: "Moderator", value: `${interaction.user} (${interaction.user.id})`, inline: true },
								{ name: "Reason", value: reason ?? "None", inline: false },
							],
							timestamp: new Date().toISOString(),
						},
					],
				})
			}
		} catch (error) {
			this.container.client.logger.error(
				new Error(`Failed to warn user ${userId}: ${error instanceof Error ? error.message : String(error)}`),
			)
			try {
				if (interaction.replied || interaction.deferred) {
					await interaction.editReply({
						content: "❌ An error occurred while warning the user. Please try again.",
					})
				} else {
					await interaction.reply({
						content: "❌ An error occurred while warning the user. Please try again.",
						flags: MessageFlags.Ephemeral,
					})
				}
			} catch {
				// Ignore response errors
			}
		}
		return
	}
}

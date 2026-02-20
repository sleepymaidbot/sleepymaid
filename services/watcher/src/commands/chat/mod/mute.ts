import { Context, SlashCommand } from "@sleepymaid/handler"
import { getTimeTable } from "@sleepymaid/util"
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

const DISCORD_MAX_TIMEOUT_SECONDS = 28 * 24 * 3600

function durationToSeconds(d: ReturnType<typeof getTimeTable>): number {
	return ((d.weeks ?? 0) * 7 + (d.days ?? 0)) * 86400 + (d.hours ?? 0) * 3600 + (d.minutes ?? 0) * 60 + (d.seconds ?? 0)
}

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "mute",
				description: "Timeout a user",
				defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
				contexts: [InteractionContextType.Guild],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				options: [
					{
						name: "user",
						description: "The user to mute",
						type: ApplicationCommandOptionType.User,
						required: true,
					},
					{
						name: "duration",
						description: "Duration (e.g. 1d, 2w, 30d)",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
					{
						name: "reason",
						description: "The reason for the mute",
						type: ApplicationCommandOptionType.String,
						required: false,
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
		const silent = interaction.options.getBoolean("silent") ?? false

		try {
			await interaction.deferReply({ flags: silent ? MessageFlags.Ephemeral : undefined })
		} catch (error) {
			this.container.client.logger.error(
				new Error(`deferReply failed: ${error instanceof Error ? error.message : String(error)}`),
			)
			return
		}

		const member = interaction.options.getMember("user")
		if (!member) {
			await interaction.editReply({ content: "User not found." }).catch(() => null)
			return
		}
		const durationStr = interaction.options.getString("duration", true)
		let reason: string | null
		try {
			reason = validateReason(interaction.options.getString("reason"))
		} catch (error) {
			await interaction
				.editReply({ content: error instanceof Error ? error.message : "Invalid reason provided." })
				.catch(() => null)
			return
		}

		const duration = getTimeTable(durationStr)
		const durationSeconds = durationToSeconds(duration)
		if (durationSeconds <= 0) {
			await interaction.editReply({ content: "Invalid duration (e.g. 1d, 2w, 28d)." }).catch(() => null)
			return
		}

		const drizzle = this.container.client.drizzle
		const userId = member.id

		try {
			const { weight1: moderatorWeight, weight2: targetWeight } = await this.container.manager.compareUserWeight(
				interaction.member,
				member,
			)
			if (moderatorWeight <= targetWeight)
				return interaction.editReply({
					content: "You cannot mute this user because they have a higher or equal weight than you.",
				})

			await upsertUserData(drizzle, userId, member.user.username, member.displayName)

			const reply = await interaction.fetchReply()
			const caseNumber = await this.container.manager.getNextCaseNumber(interaction.guild.id)

			const expiresAt = new Date(Date.now() + durationSeconds * 1000)
			await createModCase(
				drizzle,
				interaction.guild.id,
				caseNumber,
				reply.id,
				userId,
				"timeout",
				interaction.user.id,
				reason,
				expiresAt,
			)

			const timeoutMs =
				durationSeconds <= DISCORD_MAX_TIMEOUT_SECONDS ? durationSeconds * 1000 : DISCORD_MAX_TIMEOUT_SECONDS * 1000
			try {
				await member.timeout(timeoutMs, reason ?? undefined)
			} catch (error) {
				await interaction.editReply({
					content: `❌ Failed to timeout ${member}. Case #${caseNumber} was created. ${error instanceof Error ? error.message : "Missing permissions"}`,
				})
				return
			}

			const muteMessage =
				durationSeconds > DISCORD_MAX_TIMEOUT_SECONDS
					? `✅ ${member} has been muted for ${durationStr}. Case #${caseNumber}. Expires <t:${Math.floor(expiresAt.getTime() / 1000)}:R> (extended mute; timeout will be re-applied until expiry)`
					: `✅ ${member} has been muted for ${durationStr}. Case #${caseNumber}. Expires <t:${Math.floor(expiresAt.getTime() / 1000)}:R>`
			await interaction.editReply({
				content: muteMessage,
			})

			await this.container.manager.sendModDm(member.user, interaction.guild.name, {
				caseNumber,
				type: "muted",
				reason,
				modTag: interaction.user.tag,
				duration: durationStr,
				expiresAt,
			})

			const channels = await this.container.manager.getLogChannel(interaction.guild.id)
			if (channels?.length) {
				await this.container.manager.sendModLog(channels, {
					embeds: [
						{
							title: `Case #${caseNumber} | Timeout`,
							color: Colors.Orange,
							fields: [
								{ name: "User", value: `${member} (${userId})`, inline: true },
								{ name: "Moderator", value: `${interaction.user} (${interaction.user.id})`, inline: true },
								{ name: "Duration", value: durationStr, inline: true },
								{ name: "Expires", value: `<t:${Math.floor(expiresAt.getTime() / 1000)}:R>`, inline: true },
								{ name: "Reason", value: reason ?? "None", inline: false },
							],
							timestamp: new Date().toISOString(),
						},
					],
				})
			}
		} catch (error) {
			const msg = error instanceof Error ? error.message : String(error)
			this.container.client.logger.error(new Error(`Failed to mute user ${userId}: ${msg}`))
			if (msg.includes("Unknown interaction")) return
			await interaction
				.editReply({ content: "❌ An error occurred while muting the user. Please try again." })
				.catch(() => null)
		}
		return
	}
}

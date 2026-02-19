import { modCase, userData } from "@sleepymaid/db"
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
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

function durationToSeconds(d: ReturnType<typeof getTimeTable>): number {
	return ((d.weeks ?? 0) * 7 + (d.days ?? 0)) * 86400 + (d.hours ?? 0) * 3600 + (d.minutes ?? 0) * 60 + (d.seconds ?? 0)
}

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "ban",
				description: "Ban a user",
				defaultMemberPermissions: PermissionFlagsBits.BanMembers,
				contexts: [InteractionContextType.Guild],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				options: [
					{
						name: "user",
						description: "The user to ban",
						type: ApplicationCommandOptionType.User,
						required: true,
					},
					{
						name: "duration",
						description: "Duration for temp ban (e.g. 1d, 2w, 30d). Omit for permanent.",
						type: ApplicationCommandOptionType.String,
						required: false,
					},
					{
						name: "reason",
						description: "The reason for the ban",
						type: ApplicationCommandOptionType.String,
						required: false,
					},
					{
						name: "delete_days",
						description: "Delete messages from the last N days (0-7)",
						type: ApplicationCommandOptionType.Integer,
						required: false,
						minValue: 0,
						maxValue: 7,
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
		const targetUser = interaction.options.getUser("user", true)
		const durationStr = interaction.options.getString("duration")
		const reason = interaction.options.getString("reason") ?? undefined
		const deleteDays = interaction.options.getInteger("delete_days") ?? 0
		const deleteMessageSeconds = Math.min(deleteDays * 86400, 604800)
		const drizzle = this.container.client.drizzle
		const userId = targetUser.id
		const silent = interaction.options.getBoolean("silent") ?? false

		let durationSeconds = 0
		let expiresAt: Date | null = null
		if (durationStr) {
			const duration = getTimeTable(durationStr)
			durationSeconds = durationToSeconds(duration)
			if (durationSeconds <= 0)
				return interaction.reply({
					content: "Invalid duration (e.g. 1d, 2w, 30d).",
					flags: MessageFlags.Ephemeral,
				})
			expiresAt = new Date(Date.now() + durationSeconds * 1000)
		}

		await interaction.deferReply({ flags: silent ? MessageFlags.Ephemeral : undefined })

		const member = interaction.options.getMember("user")
		if (member) {
			const { weight1: moderatorWeight, weight2: targetWeight } = await this.container.manager.compareUserWeight(
				interaction.member,
				member,
			)
			if (moderatorWeight <= targetWeight)
				return interaction.editReply({
					content: "You cannot ban this user because they have a higher or equal weight than you.",
				})
		}

		await drizzle
			.insert(userData)
			.values({
				userId,
				userName: targetUser.username,
				displayName: targetUser.displayName ?? null,
			})
			.onConflictDoUpdate({
				target: userData.userId,
				set: { userName: targetUser.username, displayName: targetUser.displayName ?? null },
			})

		const reply = await interaction.fetchReply()
		const caseNumber = await this.container.manager.getNextCaseNumber(interaction.guild.id)

		await drizzle.insert(modCase).values({
			guildId: interaction.guild.id,
			caseNumber,
			messageId: reply.id,
			userId,
			reason,
			type: "ban",
			modId: interaction.user.id,
			expiresAt: expiresAt ?? undefined,
		})

		await this.container.manager.sendModDm(targetUser, interaction.guild.name, {
			caseNumber,
			type: "banned",
			reason: reason ?? null,
			modTag: interaction.user.tag,
			...(durationStr && { duration: durationStr }),
			...(expiresAt && { expiresAt }),
		})
		try {
			await interaction.guild.members.ban(userId, {
				reason: reason ?? undefined,
				deleteMessageSeconds,
			})
		} catch (error) {
			await interaction.editReply({
				content: `❌ Failed to ban ${targetUser}. Case #${caseNumber} was created. ${error instanceof Error ? error.message : "Missing permissions"}`,
			})
			return
		}

		const content = expiresAt
			? `✅ ${targetUser} has been banned for ${durationStr}. Case #${caseNumber}. Expires <t:${Math.floor(expiresAt.getTime() / 1000)}:R>.`
			: `✅ ${targetUser} has been banned. Case #${caseNumber}.`
		await interaction.editReply({ content })

		const channels = await this.container.manager.getLogChannel(interaction.guild.id)
		if (channels?.length) {
			await this.container.manager.sendModLog(channels, {
				embeds: [
					{
						title: `Case #${caseNumber} | Ban`,
						color: Colors.Red,
						fields: [
							{ name: "User", value: `${targetUser} (${userId})`, inline: true },
							{ name: "Moderator", value: `${interaction.user} (${interaction.user.id})`, inline: true },
							...(durationStr
								? [
										{ name: "Duration", value: durationStr, inline: true },
										{
											name: "Expires",
											value: `<t:${Math.floor(expiresAt!.getTime() / 1000)}:R>`,
											inline: true,
										},
									]
								: []),
							{ name: "Reason", value: reason ?? "None", inline: false },
						],
						timestamp: new Date().toISOString(),
					},
				],
			})
		}
		return
	}
}

import { modCase } from "@sleepymaid/db"
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
import { and, eq, gt, isNull } from "drizzle-orm"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "unmute",
				description: "Remove a user's timeout",
				defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
				contexts: [InteractionContextType.Guild],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				options: [
					{
						name: "user",
						description: "The user to unmute",
						type: ApplicationCommandOptionType.User,
						required: true,
					},
					{
						name: "reason",
						description: "The reason for the unmute",
						type: ApplicationCommandOptionType.String,
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
		const reason = interaction.options.getString("reason") ?? undefined
		const drizzle = this.container.client.drizzle
		const userId = member.id

		const { weight1: moderatorWeight, weight2: targetWeight } = await this.container.manager.compareUserWeight(
			interaction.member,
			member,
		)
		if (moderatorWeight <= targetWeight)
			return interaction.reply({
				content: "You cannot unmute this user because they have a higher or equal weight than you.",
				flags: MessageFlags.Ephemeral,
			})

		await interaction.reply({ content: "Unmuting...", withResponse: true })
		const reply = await interaction.fetchReply()

		try {
			await member.timeout(null, reason ?? undefined)
		} catch (error) {
			await interaction.editReply({
				content: `❌ Failed to remove timeout from ${member}. ${error instanceof Error ? error.message : "Missing permissions"}`,
			})
			return
		}
		await drizzle
			.update(modCase)
			.set({ resolvedAt: new Date() })
			.where(
				and(
					eq(modCase.guildId, interaction.guild.id),
					eq(modCase.userId, userId),
					eq(modCase.type, "timeout"),
					gt(modCase.expiresAt, new Date()),
					isNull(modCase.resolvedAt),
				),
			)

		const caseNumber = await this.container.manager.getNextCaseNumber(interaction.guild.id)
		await drizzle.insert(modCase).values({
			guildId: interaction.guild.id,
			caseNumber,
			messageId: reply.id,
			userId,
			reason,
			type: "untimeout",
			modId: interaction.user.id,
		})

		await interaction.editReply({
			content: `✅ ${member} has been unmuted. Case #${caseNumber}`,
		})

		await this.container.manager.sendModDm(member.user, interaction.guild.name, {
			caseNumber,
			type: "unmuted",
			reason: reason ?? null,
			modTag: interaction.user.tag,
		})

		const channels = await this.container.manager.getLogChannel(interaction.guild.id)
		if (channels?.length) {
			await this.container.manager.sendModLog(channels, {
				embeds: [
					{
						title: `Case #${caseNumber} | Untimeout`,
						color: Colors.Green,
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
		return
	}
}

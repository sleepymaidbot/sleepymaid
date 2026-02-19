import { modCase, userData } from "@sleepymaid/db"
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
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "kick",
				description: "Kick a user from the server",
				defaultMemberPermissions: PermissionFlagsBits.KickMembers,
				contexts: [InteractionContextType.Guild],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				options: [
					{
						name: "user",
						description: "The user to kick",
						type: ApplicationCommandOptionType.User,
						required: true,
					},
					{
						name: "reason",
						description: "The reason for the kick",
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
		const member = interaction.options.getMember("user")
		if (!member) return interaction.reply({ content: "User not found.", flags: MessageFlags.Ephemeral })
		const reason = interaction.options.getString("reason") ?? undefined
		const drizzle = this.container.client.drizzle
		const userId = member.id
		const silent = interaction.options.getBoolean("silent") ?? false

		await interaction.deferReply({ flags: silent ? MessageFlags.Ephemeral : undefined })

		const { weight1: moderatorWeight, weight2: targetWeight } = await this.container.manager.compareUserWeight(
			interaction.member,
			member,
		)
		if (moderatorWeight <= targetWeight)
			return interaction.editReply({
				content: "You cannot kick this user because they have a higher or equal weight than you.",
			})

		await drizzle
			.insert(userData)
			.values({
				userId,
				userName: member.user.username,
				displayName: member.displayName,
			})
			.onConflictDoUpdate({
				target: userData.userId,
				set: { userName: member.user.username, displayName: member.displayName },
			})

		const reply = await interaction.fetchReply()
		const caseNumber = await this.container.manager.getNextCaseNumber(interaction.guild.id)

		await drizzle.insert(modCase).values({
			guildId: interaction.guild.id,
			caseNumber,
			messageId: reply.id,
			userId,
			reason,
			type: "kick",
			modId: interaction.user.id,
		})

		await this.container.manager.sendModDm(member.user, interaction.guild.name, {
			caseNumber,
			type: "kicked",
			reason: reason ?? null,
			modTag: interaction.user.tag,
		})
		try {
			await member.kick(reason ?? undefined)
		} catch (error) {
			await interaction.editReply({
				content: `❌ Failed to kick ${member}. Case #${caseNumber} was created. ${error instanceof Error ? error.message : "Missing permissions"}`,
			})
			return
		}

		await interaction.editReply({
			content: `✅ ${member} has been kicked. Case #${caseNumber}`,
		})

		const channels = await this.container.manager.getLogChannel(interaction.guild.id)
		if (channels?.length) {
			await this.container.manager.sendModLog(channels, {
				embeds: [
					{
						title: `Case #${caseNumber} | Kick`,
						color: Colors.Red,
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

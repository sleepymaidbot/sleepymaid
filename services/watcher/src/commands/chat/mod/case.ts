import { modCase, types } from "@sleepymaid/db"
import { Context, SlashCommand } from "@sleepymaid/handler"
import {
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	Colors,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
} from "discord.js"
import { and, desc, eq } from "drizzle-orm"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "case",
				description: "Show details of a case",
				defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
				contexts: [InteractionContextType.Guild],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				options: [
					{
						name: "case",
						description: "The case to view",
						type: ApplicationCommandOptionType.String,
						required: true,
						autocomplete: true,
					},
				],
			},
		})
	}

	public override async autocomplete(interaction: AutocompleteInteraction) {
		if (!interaction.guild) return
		const drizzle = this.container.client.drizzle
		const focused = interaction.options.getFocused()
		const cases = await drizzle.query.modCase.findMany({
			where: eq(modCase.guildId, interaction.guild!.id),
			orderBy: [desc(modCase.caseNumber)],
			limit: 25,
			columns: { caseNumber: true, type: true, userId: true },
		})
		const choices = await Promise.all(
			cases.map(async (c) => {
				const user = await this.container.client.users.fetch(c.userId).catch(() => null)
				const target = user?.username ?? c.userId
				const name = `#${c.caseNumber} | ${c.type} | ${target}`
				return { name: name.length > 100 ? name.slice(0, 97) + "..." : name, value: String(c.caseNumber) }
			}),
		)
		const filtered =
			focused.length === 0
				? choices
				: choices.filter((c) => c.value === focused || c.name.toLowerCase().includes(focused.toLowerCase()))
		await interaction.respond(filtered.slice(0, 25))
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) return
		if (!interaction.inCachedGuild()) return
		const caseNumber = Number(interaction.options.getString("case", true))
		if (!Number.isInteger(caseNumber) || caseNumber < 1)
			return interaction.reply({ content: "Invalid case.", flags: MessageFlags.Ephemeral })
		const drizzle = this.container.client.drizzle

		const targetCase = await drizzle.query.modCase.findFirst({
			where: and(eq(modCase.guildId, interaction.guild.id), eq(modCase.caseNumber, caseNumber)),
			columns: {
				caseNumber: true,
				type: true,
				userId: true,
				reason: true,
				modId: true,
				createdAt: true,
				expiresAt: true,
				resolvedAt: true,
			},
		})
		if (!targetCase)
			return interaction.reply({
				content: `Case #${caseNumber} not found.`,
				flags: MessageFlags.Ephemeral,
			})

		const [targetUser, modUser] = await Promise.all([
			this.container.client.users.fetch(targetCase.userId).catch(() => null),
			targetCase.modId ? this.container.client.users.fetch(targetCase.modId).catch(() => null) : Promise.resolve(null),
		])
		const typeLabel = types.moderationEvents[targetCase.type as keyof typeof types.moderationEvents] ?? targetCase.type
		const fields = [
			{ name: "Type", value: typeLabel, inline: true },
			{
				name: "User",
				value: targetUser ? `${targetUser.tag} (${targetCase.userId})` : targetCase.userId,
				inline: true,
			},
			{
				name: "Moderator",
				value: modUser ? `${modUser.tag} (${targetCase.modId})` : (targetCase.modId ?? "Unknown"),
				inline: true,
			},
			{ name: "Reason", value: targetCase.reason ?? "None", inline: false },
			{
				name: "Created",
				value: `<t:${Math.floor(targetCase.createdAt.getTime() / 1000)}:F>`,
				inline: true,
			},
		]
		if (targetCase.expiresAt)
			fields.push({
				name: "Expires",
				value: `<t:${Math.floor(targetCase.expiresAt.getTime() / 1000)}:F>`,
				inline: true,
			})
		if (targetCase.resolvedAt)
			fields.push({
				name: "Resolved",
				value: `<t:${Math.floor(targetCase.resolvedAt.getTime() / 1000)}:F>`,
				inline: true,
			})

		return interaction.reply({
			embeds: [
				{
					title: `Case #${targetCase.caseNumber}`,
					color: Colors.Blurple,
					fields,
					timestamp: targetCase.createdAt.toISOString(),
				},
			],
			flags: MessageFlags.Ephemeral,
		})
	}
}

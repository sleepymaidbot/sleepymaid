import { modCase, types } from "@sleepymaid/db"
import { Context, SlashCommand } from "@sleepymaid/handler"
import type { APIEmbed } from "discord-api-types/v10"
import {
	ActionRowBuilder,
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	InteractionContextType,
	MessageFlags,
	MessageComponentInteraction,
	PermissionFlagsBits,
} from "discord.js"
import { and, desc, eq, sql } from "drizzle-orm"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

const TYPE_CHOICES = [
	{ name: "Warn", value: "warn" },
	{ name: "Mute", value: "mute" },
	{ name: "Unmute", value: "unmute" },
	{ name: "Timeout", value: "timeout" },
	{ name: "Untimeout", value: "untimeout" },
	{ name: "Kick", value: "kick" },
	{ name: "Ban", value: "ban" },
	{ name: "Unban", value: "unban" },
] as const

const PER_PAGE = 10

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "cases",
				description: "List cases in the server",
				defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
				contexts: [InteractionContextType.Guild],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				options: [
					{
						name: "user",
						description: "Filter by user",
						type: ApplicationCommandOptionType.User,
						required: false,
					},
					{
						name: "type",
						description: "Filter by case type",
						type: ApplicationCommandOptionType.String,
						required: false,
						choices: [...TYPE_CHOICES],
					},
				],
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) return
		if (!interaction.inCachedGuild()) return
		const filterUser = interaction.options.getUser("user")
		const filterType = interaction.options.getString("type") as (typeof TYPE_CHOICES)[number]["value"] | null
		const drizzle = this.container.client.drizzle

		const conditions = [eq(modCase.guildId, interaction.guild.id)]
		if (filterUser) conditions.push(eq(modCase.userId, filterUser.id))
		if (filterType) conditions.push(eq(modCase.type, filterType))

		const totalResult = await drizzle
			.select({ count: sql<number>`count(*)::int` })
			.from(modCase)
			.where(and(...conditions))
		const total = totalResult[0]?.count ?? 0
		const maxPage = Math.max(1, Math.ceil(total / PER_PAGE))

		const getEmbed = async (
			page: number,
			userId: string | null,
			typeVal: string | null,
		): Promise<{ embeds: APIEmbed[]; components: ActionRowBuilder<ButtonBuilder>[] }> => {
			page = Math.max(1, Math.min(maxPage, page))
			const conds = [eq(modCase.guildId, interaction.guild!.id)]
			if (userId) conds.push(eq(modCase.userId, userId))
			if (typeVal)
				conds.push(
					eq(modCase.type, typeVal as "warn" | "mute" | "unmute" | "timeout" | "untimeout" | "kick" | "ban" | "unban"),
				)

			const cases = await drizzle.query.modCase.findMany({
				where: and(...conds),
				orderBy: [desc(modCase.caseNumber)],
				limit: PER_PAGE,
				offset: (page - 1) * PER_PAGE,
				columns: { caseNumber: true, type: true, userId: true, reason: true, createdAt: true },
			})

			const typeLabel = (t: string) => types.moderationEvents[t as keyof typeof types.moderationEvents] ?? t
			const lines = await Promise.all(
				cases.map(async (c) => {
					const user = await this.container.client.users.fetch(c.userId).catch(() => null)
					const target = user?.username ?? c.userId
					const reason = (c.reason ?? "None").slice(0, 40)
					const reasonSuffix = (c.reason?.length ?? 0) > 40 ? "…" : ""
					return `**#${c.caseNumber}** ${typeLabel(c.type)} • ${target}\n${reason}${reasonSuffix} • <t:${Math.floor(c.createdAt.getTime() / 1000)}:R>`
				}),
			)
			const uid = userId ?? "x"
			const typ = typeVal ?? "x"
			const title =
				userId || typeVal
					? `Cases • Page ${page}/${maxPage}${userId ? ` • User filter` : ""}${typeVal ? ` • ${typeLabel(typeVal)}` : ""}`
					: `Cases • Page ${page}/${maxPage}`

			const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setCustomId(page === 1 ? "cases_prev_disabled" : `cases_${page - 1}_${uid}_${typ}`)
					.setEmoji("⬅️")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page === 1),
				new ButtonBuilder()
					.setCustomId(`cases_page_${uid}_${typ}`)
					.setLabel(`${page} / ${maxPage}`)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true),
				new ButtonBuilder()
					.setCustomId(page >= maxPage ? "cases_next_disabled" : `cases_${page + 1}_${uid}_${typ}`)
					.setEmoji("➡️")
					.setStyle(ButtonStyle.Primary)
					.setDisabled(page >= maxPage),
			)

			return {
				embeds: [
					{
						title,
						color: Colors.Blurple,
						description: lines.length > 0 ? lines.join("\n\n") : "No cases on this page.",
						timestamp: new Date().toISOString(),
					},
				],
				components: [row],
			}
		}

		if (total === 0)
			return interaction.reply({
				content: "No cases found.",
				flags: MessageFlags.Ephemeral,
			})

		if (!interaction.deferred) await interaction.deferReply({ flags: MessageFlags.Ephemeral })
		const payload = await getEmbed(1, filterUser?.id ?? null, filterType)
		const message = await interaction.editReply(payload)

		message
			.createMessageComponentCollector({
				time: 1000 * 60 * 5,
				filter: (i: MessageComponentInteraction) =>
					i.customId.startsWith("cases_") && !i.customId.endsWith("_disabled"),
			})
			.on("collect", async (i: MessageComponentInteraction) => {
				if (i.user.id !== interaction.user.id) {
					await i.reply({ content: "This is not your interaction.", flags: MessageFlags.Ephemeral })
					return
				}
				const parts = i.customId.split("_")
				if (parts[1] === "page") return
				const page = parseInt(parts[1] ?? "1", 10)
				const nextUserId: string | null = (parts[2] ?? "x") === "x" ? null : (parts[2] as string)
				const nextType: string | null = (parts[3] ?? "x") === "x" ? null : (parts[3] as string)
				await i.update(await getEmbed(page, nextUserId, nextType))
			})
			.on("end", () => {
				interaction.editReply({ components: [] }).catch(() => null)
			})
		return
	}
}

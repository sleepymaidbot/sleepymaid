import { modCase } from "@sleepymaid/db"
import { Context, SlashCommand } from "@sleepymaid/handler"
import {
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
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
				name: "reason",
				description: "Change the reason of a case",
				defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
				contexts: [InteractionContextType.Guild],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				options: [
					{
						name: "case",
						description: "The case to update",
						type: ApplicationCommandOptionType.String,
						required: true,
						autocomplete: true,
					},
					{
						name: "reason",
						description: "The new reason",
						type: ApplicationCommandOptionType.String,
						required: true,
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
		const reason = interaction.options.getString("reason", true)
		const drizzle = this.container.client.drizzle

		const [updated] = await drizzle
			.update(modCase)
			.set({ reason })
			.where(and(eq(modCase.guildId, interaction.guild.id), eq(modCase.caseNumber, caseNumber)))
			.returning({ caseNumber: modCase.caseNumber, type: modCase.type })

		if (!updated)
			return interaction.reply({
				content: `Case #${caseNumber} not found.`,
				flags: MessageFlags.Ephemeral,
			})

		return interaction.reply({
			content: `Updated reason for case #${updated.caseNumber} (${updated.type}).`,
			flags: MessageFlags.Ephemeral,
		})
	}
}

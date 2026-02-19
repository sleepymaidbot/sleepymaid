import { roleWeight } from "@sleepymaid/db"
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
import { and, desc, eq } from "drizzle-orm"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "role-weight",
				description: "Manage role weights",
				defaultMemberPermissions: PermissionFlagsBits.ManageRoles,
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				contexts: [InteractionContextType.Guild],
				options: [
					{
						name: "set",
						description: "Set the weight of a role",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "role",
								description: "The role to set the weight of",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
							{
								name: "weight",
								description: "The weight to set the role to",
								type: ApplicationCommandOptionType.Integer,
								required: true,
								minValue: 0,
								maxValue: 250,
							},
						],
					},
					{
						name: "view",
						description: "View the weight of a role",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "role",
								description: "The role to view",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: "list",
						description: "List all role weights",
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.guild) return
		if (!interaction.inCachedGuild()) return
		const subcommand = interaction.options.getSubcommand()
		const drizzle = this.container.client.drizzle

		switch (subcommand) {
			case "set":
				await this.set(interaction, drizzle)
				break
			case "view":
				await this.view(interaction, drizzle)
				break
			case "list":
				await this.list(interaction, drizzle)
				break
			default:
				await interaction.reply({ content: "Invalid subcommand", flags: MessageFlags.Ephemeral })
		}
	}

	private async set(interaction: ChatInputCommandInteraction<"cached">, drizzle: typeof this.container.client.drizzle) {
		const role = interaction.options.getRole("role", true)
		const weight = interaction.options.getInteger("weight", true)
		if (weight < 0 || weight > 250)
			return interaction.reply({ content: "Weight must be between 0 and 250.", flags: MessageFlags.Ephemeral })

		await drizzle
			.insert(roleWeight)
			.values({
				guildId: interaction.guild.id,
				roleId: role.id,
				weight,
			})
			.onConflictDoUpdate({
				target: [roleWeight.guildId, roleWeight.roleId],
				set: { weight },
			})

		await this.container.manager.invalidateRoleWeightsCache(interaction.guild.id)

		return interaction.reply({ content: `Set the weight of ${role} to ${weight}.`, flags: MessageFlags.Ephemeral })
	}

	private async view(
		interaction: ChatInputCommandInteraction<"cached">,
		drizzle: typeof this.container.client.drizzle,
	) {
		const role = interaction.options.getRole("role", true)
		const weight = await drizzle.query.roleWeight.findFirst({
			where: and(eq(roleWeight.guildId, interaction.guild.id), eq(roleWeight.roleId, role.id)),
		})

		if (!weight)
			return interaction.reply({
				content: `${role} does not have a weight set.`,
				flags: MessageFlags.Ephemeral,
			})

		return interaction.reply({
			embeds: [
				{
					title: "Role Weight",
					color: Colors.Blurple,
					fields: [
						{ name: "Role", value: `${role}`, inline: true },
						{ name: "Weight", value: String(weight.weight), inline: true },
					],
					timestamp: new Date().toISOString(),
				},
			],
			flags: MessageFlags.Ephemeral,
		})
	}

	private async list(
		interaction: ChatInputCommandInteraction<"cached">,
		drizzle: typeof this.container.client.drizzle,
	) {
		const weights = await drizzle.query.roleWeight.findMany({
			where: eq(roleWeight.guildId, interaction.guild.id),
			orderBy: [desc(roleWeight.weight)],
		})

		if (weights.length === 0)
			return interaction.reply({
				content: "No role weights configured.",
				flags: MessageFlags.Ephemeral,
			})

		const lines = await Promise.all(
			weights.map(async (w) => {
				const role = interaction.guild.roles.cache.get(w.roleId)
				return `**${role?.name ?? "Unknown Role"}** (${w.roleId}): ${w.weight}`
			}),
		)

		return interaction.reply({
			embeds: [
				{
					title: "Role Weights",
					color: Colors.Blurple,
					description: lines.join("\n"),
					timestamp: new Date().toISOString(),
				},
			],
			flags: MessageFlags.Ephemeral,
		})
	}
}

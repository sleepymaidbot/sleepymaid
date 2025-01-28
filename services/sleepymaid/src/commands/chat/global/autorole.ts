import { Context, SlashCommand } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient";
import {
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
	PermissionFlagsBits,
	PermissionsBitField,
} from "discord.js";
import { autoRoles } from "@sleepymaid/db";
import { and, eq } from "drizzle-orm";
export default class AutoRoleCommand extends SlashCommand<SleepyMaidClient> {
	constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "autorole",
				description: "Base command for autorole.",
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				contexts: [InteractionContextType.Guild],
				defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.ManageRoles]),
				options: [
					{
						name: "add",
						description: "Adds an autorole to the guild.",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "role",
								description: "The role to add.",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: "remove",
						description: "Removes an autorole from the guild.",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "role",
								description: "The role to remove.",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: "list",
						description: "Lists all autoroles in the guild.",
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return;
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case "add":
				return await this.add(interaction);
			case "remove":
				return await this.remove(interaction);
			case "list":
				return await this.list(interaction);
			default:
				return await interaction.editReply({
					content: "Invalid subcommand.",
				});
		}
	}

	private async add(interaction: ChatInputCommandInteraction<"cached">) {
		// Check if bot has manageRoles permission
		if (
			interaction.guild.members.me &&
			!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)
		) {
			return await interaction.editReply({
				content: "The bot needs to have the ``Manage Roles`` permission for this command to work.",
			});
		}
		const role = interaction.options.getRole("role", true);
		const roles = await this.container.drizzle.query.autoRoles.findMany({
			where: eq(autoRoles.guildId, interaction.guild.id),
		});
		if (roles.length >= 5) {
			return await interaction.editReply({
				content: "You can only have 5 autoroles.",
			});
		}
		if (roles.some((r) => r.roleId === role.id)) {
			return await interaction.editReply({
				content: "This role is already an autorole.",
			});
		}
		await this.container.drizzle.insert(autoRoles).values({
			guildId: interaction.guild.id,
			roleId: role.id,
		});
		return await interaction.editReply({
			content: `Added ${role} to the autoroles.`,
		});
	}

	private async remove(interaction: ChatInputCommandInteraction<"cached">) {
		const role = interaction.options.getRole("role", true);
		await this.container.drizzle
			.delete(autoRoles)
			.where(and(eq(autoRoles.guildId, interaction.guild.id), eq(autoRoles.roleId, role.id)));
		return await interaction.editReply({
			content: `Removed ${role} from the autoroles.`,
		});
	}

	private async list(interaction: ChatInputCommandInteraction<"cached">) {
		const roles = await this.container.drizzle.query.autoRoles.findMany({
			where: eq(autoRoles.guildId, interaction.guild.id),
		});
		if (roles.length === 0) {
			return await interaction.editReply({
				content: "No autoroles found.",
			});
		}
		return await interaction.editReply({
			content: `**Autoroles:**\n${roles.map((role) => `- <@&${role.roleId}>`).join("\n")}`,
		});
	}
}

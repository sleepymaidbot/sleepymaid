import { Context, SlashCommand } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	InteractionContextType,
} from "discord.js";
import DBCheckPrecondtion from "../../../preconditions/dbCheck";
import { rolePermissions } from "@sleepymaid/db";
import { AutocompleteChoices, getAutocompleteResults, permissionList } from "@sleepymaid/shared";
import { and, eq } from "drizzle-orm";
import { Result } from "@sapphire/result";

export default class extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			preconditions: [DBCheckPrecondtion],
			data: {
				name: "permissions",
				description: "Base command for permissions",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				contexts: [InteractionContextType.Guild],
				options: [
					{
						name: "roles",
						description: "Manage roles permissions",
						type: ApplicationCommandOptionType.SubcommandGroup,
						options: [
							{
								name: "set",
								description: "Set a role permission",
								type: ApplicationCommandOptionType.Subcommand,
								options: [
									{
										name: "role",
										description: "The role to set the permission for",
										type: ApplicationCommandOptionType.Role,
										required: true,
									},
									{
										name: "permission",
										description: "The permission to set",
										type: ApplicationCommandOptionType.String,
										autocomplete: true,
									},
									{
										name: "value",
										description: "The value of the permission",
										type: ApplicationCommandOptionType.Boolean,
									},
								],
							},
							{
								name: "remove",
								description: "Remove a role permission",
								type: ApplicationCommandOptionType.Subcommand,
								options: [
									{
										name: "role",
										description: "The role to remove the permission for",
										type: ApplicationCommandOptionType.Role,
										required: true,
									},
									{
										name: "permission",
										description: "The permission to remove",
										type: ApplicationCommandOptionType.String,
										required: true,
										autocomplete: true,
									},
								],
							},
							{
								name: "list",
								description: "List all role permissions",
								type: ApplicationCommandOptionType.Subcommand,
								options: [
									{
										name: "role",
										description: "The role to list the permissions for",
										type: ApplicationCommandOptionType.Role,
									},
								],
							},
						],
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return;
		const subcommandGroup = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();

		await interaction.deferReply({ ephemeral: true });

		switch (subcommandGroup) {
			case "roles":
				if (!(await this.container.manager.permissionQuery(interaction.member, "sleepymaid.permissions.roles.manage")))
					return interaction.editReply({
						content: "You do not have permission to manage role permissions",
					});

				switch (subcommand) {
					case "set":
						await this.roleSet(interaction);
						break;
					case "remove":
						await this.roleRemove(interaction);
						break;
					case "list":
						await this.roleList(interaction);
						break;
					default:
						break;
				}
				break;
			default:
				break;
		}

		return;
	}

	private async roleSet(interaction: ChatInputCommandInteraction<"cached">) {
		const role = interaction.options.getRole("role", true);
		const permission = interaction.options.getString("permission", true);
		const value = interaction.options.getBoolean("value", true);

		await this.container.drizzle
			.insert(rolePermissions)
			.values({
				guildId: interaction.guildId,
				roleId: role.id,
				permission,
				value,
			})
			.onConflictDoUpdate({
				target: [rolePermissions.guildId, rolePermissions.roleId, rolePermissions.permission],
				set: {
					value,
				},
			});

		return interaction.editReply({
			content: `Set role ${role.name} permission ${permission} to ${value ? "true" : "false"}`,
		});
	}

	private async roleRemove(interaction: ChatInputCommandInteraction<"cached">) {
		const role = interaction.options.getRole("role", true);
		const permission = interaction.options.getString("permission", true);

		const result = await Result.fromAsync(
			await this.container.drizzle
				.delete(rolePermissions)
				.where(and(eq(rolePermissions.roleId, role.id), eq(rolePermissions.permission, permission))),
		);

		if (result.isErr())
			return await interaction.editReply({
				content: "Failed to remove role permission",
			});

		return await interaction.editReply({
			content: `Removed role ${role.name} permission ${permission}`,
		});
	}

	private async roleList(interaction: ChatInputCommandInteraction<"cached">) {
		const role = interaction.options.getRole("role", true);

		const permissions = await this.container.drizzle.query.rolePermissions.findMany({
			where: eq(rolePermissions.roleId, role.id),
		});

		return interaction.editReply({
			content: `List of permissions for role ${role.name}:\n${permissions
				.map((p) => `${permissionList[p.permission]!.name ?? "Invalid"} - ${p.value ? "true" : "false"}`)
				.join("\n")}`,
		});
	}

	public override async autocomplete(interaction: AutocompleteInteraction) {
		const focusedValue = interaction.options.getFocused();

		const choices: AutocompleteChoices = [];

		for (const [key, value] of Object.entries(permissionList)) {
			choices.push({
				value: key,
				name: `${value.name} - ${value.description}`,
			});
		}

		await interaction.respond(getAutocompleteResults(choices, focusedValue));
	}
}

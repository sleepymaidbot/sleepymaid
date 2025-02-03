import { guildSettings } from "@sleepymaid/db";
import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationIntegrationType, InteractionContextType, MessageFlags, PermissionsBitField } from "discord.js";
import { eq } from "drizzle-orm";
import type { SleepyMaidClient } from "../../../lib/SleepyMaidClient";
import DBCheckPrecondtion from "../../../preconditions/dbCheck";

export default class SanitizerConfigCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "sanitizer",
				description: "Configure the displayname sanitizer.",
				// ...getLocalizedProp('name', 'commands.sanitizer.name'),
				// ...getLocalizedProp('description', 'commands.sanitizer.description'),
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				contexts: [InteractionContextType.Guild],
				defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.Administrator]),
				options: [
					{
						name: "toggle",
						description: "Toggle the sanitizer.",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "state",
								description: "The state of the sanitizer.",
								type: ApplicationCommandOptionType.Boolean,
								required: true,
							},
						],
					},
					{
						name: "ignoredroles",
						description: "Roles that are ignored by the sanitizer.",
						type: ApplicationCommandOptionType.SubcommandGroup,
						options: [
							{
								name: "add",
								description: "Add a role to the ignored roles.",
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
								description: "Remove a role from the ignored roles.",
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
								description: "List the ignored roles.",
								type: ApplicationCommandOptionType.Subcommand,
							},
						],
					},
				],
			},
			preconditions: [DBCheckPrecondtion],
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return;
		const client = this.container.client;
		const guildSetting = await client.drizzle.query.guildSettings.findFirst({
			where: eq(guildSettings.guildId, interaction.guildId),
		});
		if (!guildSetting) return;
		if (interaction.options.getSubcommand() === "toggle") {
			const state = interaction.options.getBoolean("state", true);
			if (guildSetting.sanitizerEnabled === state) {
				return interaction.reply({
					content: `Username sanitizer is already ${state ? "enabled" : "disabled"}.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			await client.drizzle
				.update(guildSettings)
				.set({ sanitizerEnabled: state })
				.where(eq(guildSettings.guildId, interaction.guildId));
			return interaction.reply({
				content: `Username sanitizer has been ${state ? "enabled" : "disabled"}.`,
				flags: MessageFlags.Ephemeral,
			});
		} else if (interaction.options.getSubcommandGroup() === "ignoredroles") {
			if (interaction.options.getSubcommand() === "add") {
				const role = interaction.options.getRole("role", true);
				if (guildSetting.sanitizerIgnoredRoles.includes(role.id)) {
					return interaction.reply({
						content: "That role is already ignored.",
						flags: MessageFlags.Ephemeral,
					});
				}

				await client.drizzle
					.update(guildSettings)
					.set({ sanitizerIgnoredRoles: [...guildSetting.sanitizerIgnoredRoles, role.id] })
					.where(eq(guildSettings.guildId, interaction.guildId));
				return interaction.reply({
					content: "Role has been added to the ignored roles.",
					flags: MessageFlags.Ephemeral,
				});
			} else if (interaction.options.getSubcommand() === "remove") {
				const role = interaction.options.getRole("role", true);
				if (!guildSetting.sanitizerIgnoredRoles.includes(role.id)) {
					return interaction.reply({
						content: "That role is not ignored.",
						flags: MessageFlags.Ephemeral,
					});
				}

				await client.drizzle
					.update(guildSettings)
					.set({
						sanitizerIgnoredRoles: guildSetting.sanitizerIgnoredRoles.filter((r) => r !== role.id),
					})
					.where(eq(guildSettings.guildId, interaction.guildId));

				return interaction.reply({
					content: "Role has been removed from the ignored roles.",
					flags: MessageFlags.Ephemeral,
				});
			} else if (interaction.options.getSubcommand() === "list") {
				if (guildSetting.sanitizerIgnoredRoles.length === 0) {
					return interaction.reply({
						content: "There are no ignored roles.",
						flags: MessageFlags.Ephemeral,
					});
				}

				const roles = await interaction.guild.roles.fetch();
				const deletedRoles: string[] = [];
				const ignoredRoles = guildSetting.sanitizerIgnoredRoles
					.map((r) => {
						const role = roles.get(r);
						if (role === undefined) return deletedRoles.push(r);
						return "<@&" + r + ">";
					})
					.filter((r) => r !== undefined);

				await client.drizzle
					.update(guildSettings)
					.set({
						sanitizerIgnoredRoles: [
							...new Set(guildSetting.sanitizerIgnoredRoles.filter((r) => !deletedRoles.includes(r))),
						],
					})
					.where(eq(guildSettings.guildId, interaction.guildId));

				return interaction.reply({
					content: `Ignored roles: ${ignoredRoles.join(", ")}`,
					flags: MessageFlags.Ephemeral,
				});
			}
		}

		return null;
	}
}

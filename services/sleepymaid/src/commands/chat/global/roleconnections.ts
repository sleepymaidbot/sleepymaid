import { Context } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient";
import { SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	ButtonStyle,
	ChatInputCommandInteraction,
	ComponentType,
	InteractionContextType,
	MessageComponentInteraction,
	PermissionFlagsBits,
} from "discord.js";
import { guildSettings, roleConnections } from "@sleepymaid/db";
import { and, eq } from "drizzle-orm";
import DBCheckPrecondtion from "../../../preconditions/dbCheck";

export default class extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			preconditions: [DBCheckPrecondtion],
			data: {
				name: "roleconnections",
				description: "Manage role connections",
				defaultMemberPermissions: [PermissionFlagsBits.ManageRoles],
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				contexts: [InteractionContextType.Guild],
				options: [
					{
						name: "add",
						description: "Add a role connection",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "parent",
								description: "The parent role",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
							{
								name: "child",
								description: "The child role",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: "remove",
						description: "Remove a role connection",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "parent",
								description: "The parent role",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: "list",
						description: "List all role connections",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "parent",
								description: "The parent role",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: "clear",
						description: "Clear all role connections",
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return interaction.reply("This command must be used in a guild");
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case "add":
				return this.add(interaction);
			case "remove":
				return this.remove(interaction);
			case "list":
				return this.list(interaction);
			case "clear":
				return this.clear(interaction);
			default:
				return interaction.reply("Invalid subcommand");
		}
	}

	private async add(interaction: ChatInputCommandInteraction<"cached">) {
		const guildConnections = await this.container.drizzle.query.roleConnections.findMany({
			where: eq(roleConnections.guildId, interaction.guild.id),
		});

		const guildSetting = await this.container.drizzle.query.guildSettings.findFirst({
			where: eq(guildSettings.guildId, interaction.guild.id),
		});

		if (!guildSetting) return this.container.logger.error("Guild setting not found");

		if (guildConnections.length >= 50 && guildSetting.premiumLevel < 2)
			return interaction.reply({
				content: "You can only have up to 50 role connections per guild",
				flags: MessageFlags.Ephemeral,
			});

		const parentRole = interaction.options.getRole("parent", true);
		const childRole = interaction.options.getRole("child", true);

		if (parentRole.id === childRole.id)
			return interaction.reply({ content: "A role cannot be connected to itself", flags: MessageFlags.Ephemeral });
		if (guildConnections.some((connection) => connection.childRoleId === childRole.id))
			return interaction.reply({
				content: "This role is already connected to another role",
				flags: MessageFlags.Ephemeral,
			});
		if (guildConnections.some((connection) => connection.parentRoleId === childRole.id))
			return interaction.reply({ content: "This role is already a parent role", flags: MessageFlags.Ephemeral });

		await this.container.drizzle.insert(roleConnections).values({
			guildId: interaction.guild.id,
			parentRoleId: parentRole.id,
			childRoleId: childRole.id,
		});

		return interaction.reply({
			content: `Successfully connected ${parentRole} to ${childRole}`,
			flags: MessageFlags.Ephemeral,
		});
	}

	private async remove(interaction: ChatInputCommandInteraction<"cached">) {
		const guildConnections = await this.container.drizzle.query.roleConnections.findMany({
			where: eq(roleConnections.guildId, interaction.guild.id),
		});

		const parentRole = interaction.options.getRole("parent", true);

		if (!guildConnections.some((connection) => connection.parentRoleId === parentRole.id))
			return interaction.reply({
				content: "This role is not connected to any other role",
				flags: MessageFlags.Ephemeral,
			});

		await this.container.drizzle.delete(roleConnections).where(eq(roleConnections.parentRoleId, parentRole.id));

		return interaction.reply({
			content: `Successfully removed the connection between ${parentRole} and its children`,
			flags: MessageFlags.Ephemeral,
		});
	}

	private async list(interaction: ChatInputCommandInteraction<"cached">) {
		const parentRole = interaction.options.getRole("parent", true);
		const guildConnections = await this.container.drizzle.query.roleConnections.findMany({
			where: and(eq(roleConnections.guildId, interaction.guild.id), eq(roleConnections.parentRoleId, parentRole.id)),
		});

		return interaction.reply({
			content: `List of role connections:\n${guildConnections.map((connection) => `<@&${connection.parentRoleId}> -> <@&${connection.childRoleId}>`).join("\n")}`,
			flags: MessageFlags.Ephemeral,
		});
	}

	private async clear(interaction: ChatInputCommandInteraction<"cached">) {
		if (!interaction.channel) return;

		await interaction.reply({
			content: "Are you sure you want to clear all role connections?",
			flags: MessageFlags.Ephemeral,
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							label: "Yes",
							style: ButtonStyle.Success,
							customId: "roleconnections:clear:confirm",
						},
						{
							type: ComponentType.Button,
							label: "No",
							style: ButtonStyle.Danger,
							customId: "roleconnections:clear:cancel",
						},
					],
				},
			],
		});

		await interaction.channel
			.createMessageComponentCollector({
				filter: (i: MessageComponentInteraction) => i.customId.startsWith("roleconnections:clear:"),
				time: 15000,
			})
			.on("collect", async (i: MessageComponentInteraction) => {
				if (i.user.id !== interaction.user.id) return;

				if (i.customId.startsWith("roleconnections:clear:confirm")) {
					await this.container.drizzle.delete(roleConnections).where(eq(roleConnections.guildId, interaction.guild.id));

					await interaction.editReply({ content: "Successfully cleared all role connections", components: [] });
					return await i.deferUpdate();
				} else {
					await interaction.editReply({ components: [] });
					return await i.deferUpdate();
				}
			})
			.on("end", () => {
				interaction.editReply({ components: [] });
			});
	}
}

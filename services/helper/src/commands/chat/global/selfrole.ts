import type { SlashCommandInterface } from "@sleepymaid/handler";
import { ButtonStyle } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, ChatInputApplicationCommandData } from "discord.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ComponentType,
	PermissionFlagsBits,
	PermissionsBitField,
} from "discord.js";
import type { HelperClient } from "../../../lib/extensions/HelperClient";

export default class SelfRoleCommand implements SlashCommandInterface {
	public readonly guildIds = [
		"1131653884377579651", // QCGSecret
		"1150379660128047104", // Whiteout
		"1156009175600611501", // Whiteout Test
		"796534493535928320", // Fil
	];

	public readonly data = {
		name: "selfrole",
		description: "[Admin only] Allow you to post a simple self role message.",
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.Administrator]),
		options: [
			{
				name: "role",
				description: "The role",
				type: ApplicationCommandOptionType.Role,
				required: true,
			},
		],
	} as ChatInputApplicationCommandData;

	// @ts-expect-error client overriden
	public async execute(interaction: ChatInputCommandInteraction, client: HelperClient) {
		if (!interaction.inCachedGuild()) return;
		const role = interaction.options.getRole("role");
		if (!role) return;
		if (
			role.permissions.any([
				PermissionFlagsBits.Administrator,
				PermissionFlagsBits.BanMembers,
				PermissionFlagsBits.KickMembers,
				PermissionFlagsBits.ManageChannels,
				PermissionFlagsBits.ManageGuildExpressions,
				PermissionFlagsBits.ManageGuild,
				PermissionFlagsBits.ManageMessages,
				PermissionFlagsBits.ManageRoles,
				PermissionFlagsBits.ManageWebhooks,
			])
		)
			return interaction.reply({
				content: "You cannot use this command on an admin role.",
				ephemeral: true,
				allowedMentions: { parse: [] },
			});
		if (!client.user) return;
		if (!interaction.guild) return;
		const bot = interaction.guild.members.cache.get(client.user.id);
		if (!bot) return;
		if (role.position >= bot.roles.highest.position)
			return interaction.reply({
				content: "You cannot use this command on a role higher than the bot.",
				ephemeral: true,
				allowedMentions: { parse: [] },
			});
		if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId)
			return interaction.reply({
				content: "You cannot use this command on a role higher than yours.",
				ephemeral: true,
				allowedMentions: { parse: [] },
			});
		if (!interaction.channel) return;
		await interaction.reply({
			content: "Self role message created!",
			ephemeral: true,
			allowedMentions: { parse: [] },
		});
		await interaction.channel.send({
			content: "Click the button below to get the " + role.toString() + " role!",
			allowedMentions: { parse: [] },
			components: [
				{
					type: 1,
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Primary,
							label: "Add/Remove the role",
							custom_id: "selfrole:" + role.id,
						},
					],
				},
			],
		});
	}
}

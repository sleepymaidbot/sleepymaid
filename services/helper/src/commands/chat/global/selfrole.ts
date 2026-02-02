import type { Context } from "@sleepymaid/handler"
import { SlashCommand } from "@sleepymaid/handler"
import type { ChatInputCommandInteraction } from "discord.js"
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ComponentType,
	MessageFlags,
	PermissionFlagsBits,
	PermissionsBitField,
} from "discord.js"
import type { HelperClient } from "../../../lib/extensions/HelperClient"

export default class SelfRoleCommand extends SlashCommand<HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			data: {
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
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return
		const client = this.container.client
		const role = interaction.options.getRole("role")
		if (!role) return
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
				flags: MessageFlags.Ephemeral,
				allowedMentions: { parse: [] },
			})
		if (!client.user) return
		if (!interaction.guild) return
		const bot = interaction.guild.members.cache.get(client.user.id)
		if (!bot) return
		if (role.position >= bot.roles.highest.position)
			return interaction.reply({
				content: "You cannot use this command on a role higher than the bot.",
				flags: MessageFlags.Ephemeral,
				allowedMentions: { parse: [] },
			})
		if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId)
			return interaction.reply({
				content: "You cannot use this command on a role higher than yours.",
				flags: MessageFlags.Ephemeral,
				allowedMentions: { parse: [] },
			})
		if (!interaction.channel) return
		await interaction.reply({
			content: "Self role message created!",
			flags: MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		})
		await interaction.channel.send({
			content: "Click the button below to get the " + role.toString() + " role!",
			allowedMentions: { parse: [] },
			components: [
				{
					type: 1,
					components: [
						{
							type: ComponentType.Button,
							style: 1,
							label: "Add/Remove the role",
							custom_id: "selfrole:" + role.id,
						},
					],
				},
			],
		})
		return null
	}
}

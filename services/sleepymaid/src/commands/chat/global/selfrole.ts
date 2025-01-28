import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import type { ApplicationCommandOptionChoiceData, ChatInputCommandInteraction } from "discord.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ComponentType,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	PermissionsBitField,
} from "discord.js";
import type { SleepyMaidClient } from "../../../lib/SleepyMaidClient";

enum ActionType {
	TOGGLE = "toggle",
	ADD = "add",
	REMOVE = "remove",
}

const options: Record<
	ActionType,
	ApplicationCommandOptionChoiceData<string> & { description: (roleId: string) => string; label: string }
> = {
	[ActionType.TOGGLE]: {
		name: "Toggle",
		value: "toggle",
		description: (roleId) => "Click the button below to get or remove the <@&" + roleId + "> role!",
		label: "Add/Remove the role",
	},
	[ActionType.ADD]: {
		name: "Add",
		value: "add",
		description: (roleId) => "Click the button below to get the <@&" + roleId + "> role!",
		label: "Add the role",
	},
	[ActionType.REMOVE]: {
		name: "Remove",
		value: "remove",
		description: (roleId) => "Click the button below to remove the <@&" + roleId + "> role!",
		label: "Remove the role",
	},
};

export default class SelfRoleCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "selfrole",
				description: "[Admin only] Allow you to post a simple self role message.",
				type: ApplicationCommandType.ChatInput,
				defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.ManageRoles]),
				integrationTypes: [ApplicationIntegrationType.GuildInstall],
				contexts: [InteractionContextType.Guild],
				options: [
					{
						name: "role",
						description: "The role to add/remove/toggle",
						type: ApplicationCommandOptionType.Role,
						required: true,
					},
					{
						name: "action",
						description: "What action to take with the role",
						type: ApplicationCommandOptionType.String,
						required: true,
						choices: Object.values(options),
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return;
		const client = this.container.client;
		const role = interaction.options.getRole("role");
		const action = interaction.options.getString("action");
		if (!action || !Object.values(ActionType).includes(action as ActionType))
			return this.container.logger.error("Invalid action");
		if (!role) return this.container.logger.error("Invalid role");
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
			});
		if (!client.user) return;
		if (!interaction.guild) return;
		const bot = interaction.guild.members.cache.get(client.user.id);
		if (!bot) return;
		if (role.position >= bot.roles.highest.position)
			return interaction.reply({
				content: "You cannot use this command on a role higher than the bot.",
				flags: MessageFlags.Ephemeral,
				allowedMentions: { parse: [] },
			});
		if (role.position >= interaction.member.roles.highest.position && interaction.user.id !== interaction.guild.ownerId)
			return interaction.reply({
				content: "You cannot use this command on a role higher than yours.",
				flags: MessageFlags.Ephemeral,
				allowedMentions: { parse: [] },
			});
		if (!interaction.channel) return;
		await interaction.reply({
			content: "Self role message created!",
			flags: MessageFlags.Ephemeral,
			allowedMentions: { parse: [] },
		});
		await interaction.channel.send({
			content: options[action as ActionType].description(role.id),
			allowedMentions: { parse: [] },
			components: [
				{
					type: 1,
					components: [
						{
							type: ComponentType.Button,
							style: 1,
							label: options[action as ActionType].label,
							custom_id: "selfrole:" + role.id + ":" + action,
						},
					],
				},
			],
		});
		return null;
	}
}

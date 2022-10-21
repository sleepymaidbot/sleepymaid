import 'reflect-metadata';
import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ChatInputApplicationCommandData, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { container, DependencyContainer } from 'tsyringe';
import { BotClient } from '../../../lib/extensions/BotClient';
import { configManager, SpecialRoleType } from '../../../lib/managers/global/configManager';
import {
	APIEmbed,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	PermissionFlagsBits,
} from 'discord-api-types/v10';
import { getLocalizedProp } from '@sleepymaid/shared';
import i18next from 'i18next';

const getBaseEmbed = (i: ChatInputCommandInteraction<'cached'>): APIEmbed => {
	return {
		color: 3553599,
		author: {
			name: i.member.user.tag,
			icon_url: i.member.user.avatarURL() ?? '',
		},
		timestamp: new Date(Date.now()).toISOString(),
	};
};

export default class ConfigCommand implements SlashCommandInterface {
	public readonly data = {
		...getLocalizedProp('name', 'commands.config.name'),
		...getLocalizedProp('description', 'commands.config.description'),
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.Administrator]),
		dmPermission: false,
		options: [
			{
				...getLocalizedProp('name', 'commands.config.admin-role.name'),
				...getLocalizedProp('description', 'commands.config.admin-role.description'),
				type: ApplicationCommandOptionType.SubcommandGroup,
				options: [
					{
						...getLocalizedProp('name', 'commands.config.admin-role.add.name'),

						...getLocalizedProp('description', 'commands.config.admin-role.add.description'),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								...getLocalizedProp('name', 'commands.config.admin-role.add.role.name'),
								...getLocalizedProp('description', 'commands.config.admin-role.add.role.description'),
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						...getLocalizedProp('name', 'commands.config.admin-role.remove.name'),
						...getLocalizedProp('description', 'commands.config.admin-role.remove.description'),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								...getLocalizedProp('name', 'commands.config.admin-role.remove.role.name'),
								...getLocalizedProp('description', 'commands.config.admin-role.remove.role.description'),
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						...getLocalizedProp('name', 'commands.config.admin-role.list.name'),
						...getLocalizedProp('description', 'commands.config.admin-role.list.description'),
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
			},
			{
				...getLocalizedProp('name', 'commands.config.mod-role.name'),
				...getLocalizedProp('description', 'commands.config.mod-role.description'),
				type: ApplicationCommandOptionType.SubcommandGroup,
				options: [
					{
						...getLocalizedProp('name', 'commands.config.mod-role.add.name'),
						...getLocalizedProp('description', 'commands.config.mod-role.add.description'),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								...getLocalizedProp('name', 'commands.config.mod-role.add.role.name'),
								...getLocalizedProp('description', 'commands.config.mod-role.add.role.description'),
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						...getLocalizedProp('name', 'commands.config.mod-role.remove.name'),
						...getLocalizedProp('description', 'commands.config.mod-role.remove.description'),
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								...getLocalizedProp('name', 'commands.config.mod-role.remove.role.name'),
								...getLocalizedProp('description', 'commands.config.mod-role.remove.role.description'),
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						...getLocalizedProp('name', 'commands.config.mod-role.list.name'),
						...getLocalizedProp('description', 'commands.config.mod-role.list.description'),
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
			},
		],
	} as ChatInputApplicationCommandData;

	// @ts-ignore
	public async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
		if (!interaction.inCachedGuild()) return;
		if (!interaction.guild) return;
		await interaction.deferReply();
		const subcommandGroup = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();
		const adminRoles = (
			await client.prisma.adminRole.findMany({
				where: {
					guildId: interaction.guild.id,
				},
			})
		).map((role) => role.roleId);
		const modRoles = (
			await client.prisma.modRole.findMany({
				where: {
					guildId: interaction.guild.id,
				},
			})
		).map((role) => role.roleId);

		if (subcommandGroup === 'admin-role' || subcommandGroup === 'mod-role') {
			if (
				interaction.memberPermissions.has(PermissionFlagsBits.Administrator) ||
				interaction.member.roles.cache.hasAny(...adminRoles) ||
				interaction.member.id === interaction.guild.ownerId
			) {
				let action: SpecialRoleType | undefined;
				let cleanAction: 'admin-role' | 'mod-role' | undefined;
				if (subcommandGroup === 'admin-role') {
					action = SpecialRoleType.admin;
					cleanAction = 'admin-role';
				} else if (subcommandGroup === 'mod-role') {
					action = SpecialRoleType.mod;
					cleanAction = 'mod-role';
				}
				if (action === undefined || cleanAction === undefined) return;
				const c: DependencyContainer = container;
				c.register<BotClient>(BotClient, { useValue: client });
				switch (subcommand) {
					case 'add': {
						const roleId = interaction.options.getRole('role')!.id;
						if (action === SpecialRoleType.admin) {
							if (adminRoles.includes(roleId)) {
								return await interaction.editReply({
									embeds: [
										{
											...getBaseEmbed(interaction),
											description:
												'<:redX:948606748334358559> ' +
												i18next.t(`commands.config.${cleanAction}.failure_add_already_in_list`, {
													lng: interaction.locale,
													role: roleId,
												}),
										},
									],
								});
							} else if (modRoles.includes(roleId)) {
								return await interaction.editReply({
									embeds: [
										{
											...getBaseEmbed(interaction),
											description:
												'<:redX:948606748334358559> ' +
												i18next.t(`commands.config.${cleanAction}.failure_add_already_in_other_list`, {
													lng: interaction.locale,
													role: roleId,
												}),
										},
									],
								});
							}
						} else if (action === SpecialRoleType.mod) {
							if (modRoles.includes(roleId)) {
								return await interaction.editReply({
									embeds: [
										{
											...getBaseEmbed(interaction),
											description:
												'<:redX:948606748334358559> ' +
												i18next.t(`commands.config.${cleanAction}.failure_add_already_in_list`, {
													lng: interaction.locale,
													role: roleId,
												}),
										},
									],
								});
							} else if (adminRoles.includes(roleId)) {
								return await interaction.editReply({
									embeds: [
										{
											...getBaseEmbed(interaction),
											description:
												'<:redX:948606748334358559> ' +
												i18next.t(`commands.config.${cleanAction}.failure_add_already_in_other_list`, {
													lng: interaction.locale,
													role: roleId,
												}),
										},
									],
								});
							}
						}

						await c.resolve(configManager).addSpecialRole(interaction.guild.id, roleId, action);
						return await interaction.editReply({
							embeds: [
								{
									...getBaseEmbed(interaction),
									description:
										'<:greenTick:948620600144982026> ' +
										i18next.t(`commands.config.${cleanAction}.success_add`, {
											lng: interaction.locale,
											role: roleId,
										}),
								},
							],
						});
					}
					case 'remove': {
						const roleId = interaction.options.getRole('role')!.id;
						if (action === SpecialRoleType.admin && !adminRoles.includes(roleId)) {
							return await interaction.editReply({
								embeds: [
									{
										...getBaseEmbed(interaction),
										description:
											'<:redX:948606748334358559> ' +
											i18next.t(`commands.config.${cleanAction}.failure_remove_not_in_list`, {
												lng: interaction.locale,
												role: roleId,
											}),
									},
								],
							});
						} else if (action === SpecialRoleType.mod && !modRoles.includes(roleId)) {
							return await interaction.editReply({
								embeds: [
									{
										...getBaseEmbed(interaction),
										description:
											'<:redX:948606748334358559> ' +
											i18next.t(`commands.config.${cleanAction}.failure_remove_not_in_list`, {
												lng: interaction.locale,
												role: roleId,
											}),
									},
								],
							});
						}

						await c.resolve(configManager).removeSpecialRole(interaction.guild.id, roleId, action);
						return await interaction.editReply({
							embeds: [
								{
									...getBaseEmbed(interaction),
									description:
										'<:greenTick:948620600144982026> ' +
										i18next.t(`commands.config.${cleanAction}.success_remove`, {
											lng: interaction.locale,
											role: roleId,
										}),
								},
							],
						});
					}
					case 'list': {
						let roles: string[] = [];
						if (action === SpecialRoleType.admin) {
							roles = [...adminRoles];
						} else if (action === SpecialRoleType.mod) {
							roles = [...modRoles];
						}
						const guildRoles = await interaction.guild.roles.fetch();
						for (const roleId of roles) {
							if (!guildRoles.has(roleId)) {
								roles = roles.filter((r) => r !== roleId);
								if (action === SpecialRoleType.admin) {
									await client.prisma.adminRole.delete({
										where: {
											roleId: roleId,
										},
									});
								} else if (action === SpecialRoleType.mod) {
									await client.prisma.modRole.delete({
										where: {
											roleId: roleId,
										},
									});
								}
							}
						}
						await interaction.editReply({
							embeds: [
								{
									...getBaseEmbed(interaction),
									description:
										i18next.t(`commands.config.${cleanAction}.role_list`, {
											lgn: interaction.locale,
										}) + `\n${roles.map((r) => `<@&${r}>`).join(',\n')}`,
								},
							],
						});
						break;
					}
				}
			} else {
				return await interaction.editReply({
					embeds: [
						{
							...getBaseEmbed(interaction),
							description:
								'<:redX:948606748334358559> ' +
								i18next.t(`commands.config.no_permission`, {
									lng: interaction.locale,
								}),
						},
					],
				});
			}
		}
	}
}

import 'reflect-metadata';
import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ChatInputApplicationCommandData, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { SleepyMaidClient } from '../../../lib/extensions/SleepyMaidClient';
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';

export default class SanitizerConfigCommand implements SlashCommandInterface {
	public readonly data = {
		name: 'sanitizer',
		description: 'Configure the displayname sanitizer.',
		//...getLocalizedProp('name', 'commands.sanitizer.name'),
		//...getLocalizedProp('description', 'commands.sanitizer.description'),
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.Administrator]),
		dmPermission: false,
		options: [
			{
				name: 'toggle',
				description: 'Toggle the sanitizer.',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'state',
						description: 'The state of the sanitizer.',
						type: ApplicationCommandOptionType.Boolean,
						required: true,
					},
				],
			},
			{
				name: 'ignoredroles',
				description: 'Roles that are ignored by the sanitizer.',
				type: ApplicationCommandOptionType.SubcommandGroup,
				options: [
					{
						name: 'add',
						description: 'Add a role to the ignored roles.',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'role',
								description: 'The role to add.',
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: 'remove',
						description: 'Remove a role from the ignored roles.',
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: 'role',
								description: 'The role to remove.',
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: 'list',
						description: 'List the ignored roles.',
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
			},
		],
	} as ChatInputApplicationCommandData;

	// @ts-ignore
	public async execute(interaction: ChatInputCommandInteraction, client: SleepyMaidClient) {
		if (!interaction.inCachedGuild()) return;
		const sanitizerSettings = await client.prisma.sanitizerSettings.findUnique({
			where: {
				guildId: interaction.guildId,
			},
		});
		if (!sanitizerSettings) {
			await client.prisma.guildsSettings.update({
				where: {
					guildId: interaction.guildId,
				},
				data: {
					sanitizer: {
						create: { enabled: false, ignoredRoles: [] },
					},
				},
			});
		}
		if (interaction.options.getSubcommand() === 'toggle') {
			const state = interaction.options.getBoolean('state', true);
			if (sanitizerSettings != null) {
				if (sanitizerSettings.enabled === state) {
					return await interaction.reply({
						content: `Username sanitizer is already ${state ? 'enabled' : 'disabled'}.`,
						ephemeral: true,
					});
				}
				await client.prisma.sanitizerSettings.update({
					where: {
						guildId: interaction.guildId,
					},
					data: {
						enabled: state,
					},
				});
				return await interaction.reply({
					content: `Username sanitizer has been ${state ? 'enabled' : 'disabled'}.`,
					ephemeral: true,
				});
			}
		} else if (interaction.options.getSubcommandGroup() === 'ignoredroles') {
			if (interaction.options.getSubcommand() === 'add') {
				const role = interaction.options.getRole('role', true);
				if (sanitizerSettings!.ignoredRoles.includes(role.id)) {
					return await interaction.reply({
						content: 'That role is already ignored.',
						ephemeral: true,
					});
				}
				await client.prisma.sanitizerSettings.update({
					where: {
						guildId: interaction.guildId,
					},
					data: {
						ignoredRoles: {
							push: role.id,
						},
					},
				});
				return await interaction.reply({
					content: 'Role has been added to the ignored roles.',
					ephemeral: true,
				});
			} else if (interaction.options.getSubcommand() === 'remove') {
				const role = interaction.options.getRole('role', true);
				if (!sanitizerSettings!.ignoredRoles.includes(role.id)) {
					return await interaction.reply({
						content: 'That role is not ignored.',
						ephemeral: true,
					});
				}
				await client.prisma.sanitizerSettings.update({
					where: {
						guildId: interaction.guildId,
					},
					data: {
						ignoredRoles: {
							set: sanitizerSettings!.ignoredRoles.filter((r) => r !== role.id),
						},
					},
				});
				return await interaction.reply({
					content: 'Role has been removed from the ignored roles.',
					ephemeral: true,
				});
			} else if (interaction.options.getSubcommand() === 'list') {
				if (sanitizerSettings!.ignoredRoles.length === 0) {
					return await interaction.reply({
						content: 'There are no ignored roles.',
						ephemeral: true,
					});
				}
				const roles = await interaction.guild!.roles.fetch();
				const deletedRoles: String[] = [];
				const ignoredRoles = sanitizerSettings!.ignoredRoles
					.map((r) => {
						const role = roles.get(r);
						if (role === undefined) return deletedRoles.push(r);
						return '<@&' + r + '>';
					})
					.filter((r) => r !== undefined);

				await client.prisma.sanitizerSettings.update({
					where: {
						guildId: interaction.guildId,
					},
					data: {
						ignoredRoles: {
							set: [...new Set(sanitizerSettings!.ignoredRoles.filter((r) => !deletedRoles.includes(r)))],
						},
					},
				});

				return await interaction.reply({
					content: `Ignored roles: ${ignoredRoles.join(', ')}`,
					ephemeral: true,
				});
			}
		}
	}
}

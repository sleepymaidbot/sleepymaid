import 'reflect-metadata';
import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ChatInputApplicationCommandData, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import { SleepyMaidClient } from '../../../lib/extensions/SleepyMaidClient';
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import { guildsSettings } from '@sleepymaid/db';
import { eq } from 'drizzle-orm';

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
		const guildSettings = (
			await client.drizzle.select().from(guildsSettings).where(eq(guildsSettings.guildId, interaction.guildId))
		)[0]!;
		if (interaction.options.getSubcommand() === 'toggle') {
			const state = interaction.options.getBoolean('state', true);
			if (guildSettings.sanitizerEnabled === state) {
				return await interaction.reply({
					content: `Username sanitizer is already ${state ? 'enabled' : 'disabled'}.`,
					ephemeral: true,
				});
			}
			await client.drizzle
				.update(guildsSettings)
				.set({ sanitizerEnabled: state })
				.where(eq(guildsSettings.guildId, interaction.guildId));
			return await interaction.reply({
				content: `Username sanitizer has been ${state ? 'enabled' : 'disabled'}.`,
				ephemeral: true,
			});
		} else if (interaction.options.getSubcommandGroup() === 'ignoredroles') {
			if (interaction.options.getSubcommand() === 'add') {
				const role = interaction.options.getRole('role', true);
				if (guildSettings!.sanitizerIgnoredRoles!.includes(role.id)) {
					return await interaction.reply({
						content: 'That role is already ignored.',
						ephemeral: true,
					});
				}
				await client.drizzle
					.update(guildsSettings)
					.set({ sanitizerIgnoredRoles: [...guildSettings!.sanitizerIgnoredRoles!, role.id] })
					.where(eq(guildsSettings.guildId, interaction.guildId));
				return await interaction.reply({
					content: 'Role has been added to the ignored roles.',
					ephemeral: true,
				});
			} else if (interaction.options.getSubcommand() === 'remove') {
				const role = interaction.options.getRole('role', true);
				if (!guildSettings.sanitizerIgnoredRoles!.includes(role.id)) {
					return await interaction.reply({
						content: 'That role is not ignored.',
						ephemeral: true,
					});
				}
				await client.drizzle
					.update(guildsSettings)
					.set({
						sanitizerIgnoredRoles: guildSettings!.sanitizerIgnoredRoles!.filter((r) => r !== role.id),
					})
					.where(eq(guildsSettings.guildId, interaction.guildId));

				return await interaction.reply({
					content: 'Role has been removed from the ignored roles.',
					ephemeral: true,
				});
			} else if (interaction.options.getSubcommand() === 'list') {
				if (guildSettings!.sanitizerIgnoredRoles!.length === 0) {
					return await interaction.reply({
						content: 'There are no ignored roles.',
						ephemeral: true,
					});
				}
				const roles = await interaction.guild!.roles.fetch();
				const deletedRoles: String[] = [];
				const ignoredRoles = guildSettings!
					.sanitizerIgnoredRoles!.map((r) => {
						const role = roles.get(r);
						if (role === undefined) return deletedRoles.push(r);
						return '<@&' + r + '>';
					})
					.filter((r) => r !== undefined);

				await client.drizzle
					.update(guildsSettings)
					.set({
						sanitizerIgnoredRoles: [
							...new Set(guildSettings!.sanitizerIgnoredRoles!.filter((r) => !deletedRoles.includes(r))),
						],
					})
					.where(eq(guildsSettings.guildId, interaction.guildId));

				return await interaction.reply({
					content: `Ignored roles: ${ignoredRoles.join(', ')}`,
					ephemeral: true,
				});
			}
		}
	}
}

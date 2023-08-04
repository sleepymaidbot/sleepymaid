import type { SlashCommandInterface } from '@sleepymaid/handler';
import {
	ApplicationCommandOptionType,
	ButtonStyle,
	ChannelType,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	ComponentType,
	PermissionFlagsBits,
	PermissionsBitField,
} from 'discord.js';
import { WatcherClient } from '../../lib/extensions/WatcherClient';
import { LogChannelType } from '@prisma/client';
import { createEmptySubscribedLogsObject } from '../../lib/functions/subscribedLogs';

export default class ConfigCommand implements SlashCommandInterface {
	public readonly data = {
		name: 'configchannel',
		description: 'Configure a channel for the bot to send messages to.',
		defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.ManageChannels]),
		options: [
			{
				name: 'channel',
				description: 'The channel to configure.',
				type: ApplicationCommandOptionType.Channel,
				required: true,
				channelTypes: [ChannelType.PublicThread, ChannelType.GuildText],
			},
		],
	} as ChatInputApplicationCommandData;

	// @ts-expect-error
	public async execute(interaction: ChatInputCommandInteraction<'cached'>, client: WatcherClient) {
		if (!interaction.guild) return;
		if (!interaction.channel) return;
		const channel = interaction.options.getChannel('channel', true, [ChannelType.PublicThread, ChannelType.GuildText]);
		if (!channel) return;
		if (!channel.id) return;

		const channelConfig = await client.prisma.logChannel.findUnique({
			where: {
				guildId: interaction.guild.id,
				channelId: channel.id,
			},
		});

		if (channelConfig) {
			// TODO: Add a way to configure the subscribed logs.
		} else {
			await interaction.reply({
				content: 'This channel is not yet configured. Do you want to configure it?',
				ephemeral: true,
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: 'Yes',
								style: ButtonStyle.Success,
								customId: 'configChannel:newChannel:new:yes',
							},
							{
								type: ComponentType.Button,
								label: 'No',
								style: ButtonStyle.Danger,
								customId: 'configChannel:newChannel:new:no',
							},
						],
					},
				],
			});

			await interaction.channel
				.awaitMessageComponent({
					time: 60000,
					filter: (i) =>
						i.user.id === interaction.user.id && i.customId.startsWith('configChannel:newChannel:new') && i.isButton(),
				})
				.then(async (i) => {
					if (i.customId === 'configChannel:newChannel:yes') {
						if (!i.channel) return;
						await i.update({
							content: 'Which type of logs do you want in that channel.',
							components: [
								{
									type: ComponentType.ActionRow,
									components: [
										{
											type: ComponentType.StringSelect,
											placeholder: 'Select a log type',
											custom_id: 'configChannel:newChannel:TypeSelect',
											max_values: 1,
											min_values: 1,
											options: [
												{
													label: 'Moderation',
													description: 'Timeout, bans, kicks, etc.',
													value: 'mod',
												},
												{
													label: 'Server',
													description: 'Message updates, Channel updates, etc.',
													value: 'server',
												},
											],
										},
									],
								},
							],
						});
						await i.channel
							.awaitMessageComponent({
								time: 60000,
								filter: (i) =>
									i.user.id === interaction.user.id &&
									i.customId.startsWith('configChannel:newChannel:TypeSelect') &&
									i.isStringSelectMenu(),
							})
							.then(async (i) => {
								if (!i.isStringSelectMenu()) return;
								const type = i.values[0] as LogChannelType;

								await client.prisma.guildsSettings.update({
									where: {
										guildId: interaction.guild.id,
									},
									data: {
										logChannels: {
											create: {
												channelId: channel.id,
												type: type,
												subscribedLogs: createEmptySubscribedLogsObject(type),
											},
										},
									},
								});

								await i.update({
									content:
										'This channel has been configured. Reuse this command to configure which logs you want to receive.',
									components: [],
								});
							})
							.catch(client.logger.error);
					} else {
						i.update({
							content: 'This channel will not be configured.',
							components: [],
						});
					}
				})
				.catch(client.logger.error);
		}
	}
}

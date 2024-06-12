import { logChannel } from "@sleepymaid/db";
import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import type { APISelectMenuOption, ChatInputCommandInteraction, Webhook } from "discord.js";
import {
	ApplicationCommandOptionType,
	ButtonStyle,
	ChannelType,
	ComponentType,
	PermissionFlagsBits,
	PermissionsBitField,
} from "discord.js";
import { eq } from "drizzle-orm";
import type { WatcherClient } from "../../lib/extensions/WatcherClient";

export const subscribedLogsSelectOptions = {
	mod: [
		{
			label: "Timeout",
			value: "timeout",
		},
		{
			label: "Untimeout",
			value: "untimeout",
		},
		{
			label: "Kick",
			value: "kick",
		},
		{
			label: "Ban",
			value: "ban",
		},
		{
			label: "Unban",
			value: "unban",
		},
	],
	server: [
		{
			label: "Message Edit",
			value: "messageEdit",
		},
		{
			label: "Message Delete",
			value: "messageDelete",
		},
		{
			label: "Member Join",
			value: "memberJoin",
		},
		{
			label: "Member Leave",
			value: "memberLeave",
		},
		{
			label: "Member Nickname Update",
			value: "memberNicknameUpdate",
		},
		{
			label: "Member Role Update",
			value: "memberRoleUpdate",
		},
		{
			label: "Member Voice Update",
			value: "memberVoiceUpdate",
		},
		{
			label: "Member Avatar Update",
			value: "memberAvatarUpdate",
		},
		{
			label: "Member Username Update",
			value: "memberUsernameUpdate",
		},
		{
			label: "Role Create",
			value: "roleCreate",
		},
		{
			label: "Role Delete",
			value: "roleDelete",
		},
		{
			label: "Role Update",
			value: "roleUpdate",
		},
		{
			label: "Channel Create",
			value: "channelCreate",
		},
		{
			label: "Channel Delete",
			value: "channelDelete",
		},
		{
			label: "Channel Update",
			value: "channelUpdate",
		},
		{
			label: "Emoji Create",
			value: "emojiCreate",
		},
		{
			label: "Emoji Delete",
			value: "emojiDelete",
		},
		{
			label: "Emoji Update",
			value: "emojiUpdate",
		},
		{
			label: "Invite Create",
			value: "inviteCreate",
		},
		{
			label: "Invite Delete",
			value: "inviteDelete",
		},
	],
};

export default class ConfigCommand extends SlashCommand<WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "configchannel",
				description: "Configure a channel for the bot to send messages to.",
				defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.ManageChannels]),
				options: [
					{
						name: "channel",
						description: "The channel to configure.",
						type: ApplicationCommandOptionType.Channel,
						required: true,
						channelTypes: [ChannelType.PublicThread, ChannelType.GuildText],
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const client = this.container.client;
		if (!interaction.guild) return;
		if (!interaction.channel) return;
		const channel = interaction.options.getChannel("channel", true, [ChannelType.PublicThread, ChannelType.GuildText]);
		if (!channel) return;
		if (!channel.id) return;

		const channelConfig = await client.drizzle.query.logChannel.findFirst({
			where: eq(logChannel.channelId, channel.id),
		});

		if (channelConfig) {
			const options = (): APISelectMenuOption[] => {
				const options: APISelectMenuOption[] = [];
				for (const values of subscribedLogsSelectOptions[channelConfig.type]) {
					options.push({ ...values, default: channelConfig[values.value as keyof typeof channelConfig] as boolean });
				}

				return options;
			};

			await interaction.reply({
				content: "Please select which logs you want to subscribe to.",
				ephemeral: true,
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.StringSelect,
								placeholder: "Select a log type",
								custom_id: "configChannel:config:subSelect",
								max_values: 1,
								min_values: 1,
								options: options(),
							},
						],
					},
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: "Remove logs from this channel",
								style: ButtonStyle.Danger,
								customId: "configChannel:config:removeLogs",
								emoji: {
									id: "948606748334358559",
								},
							},
						],
					},
				],
			});

			await interaction.channel
				.awaitMessageComponent({
					time: 150_000,
					filter: (i) => i.user.id === interaction.user.id && i.customId.startsWith("configChannel:config:"),
				})
				.then(async (i) => {
					await i.deferUpdate();
					switch (i.customId) {
						case "configChannel:config:subSelect": {
							if (!i.isStringSelectMenu()) return;
							const selected = i.values;
							const typeValue = subscribedLogsSelectOptions[channelConfig.type].map((v) => v.value);
							await client.drizzle.transaction(async (tx) => {
								for (const value of typeValue) {
									if (selected.includes(value)) {
										await tx
											.update(logChannel)
											.set({ [value]: true })
											.where(eq(logChannel.channelId, channel.id));
									} else {
										await tx
											.update(logChannel)
											.set({ [value]: false })
											.where(eq(logChannel.channelId, channel.id));
									}
								}
							});
							break;
						}

						case "configChannel:config:removeLogs": {
							await client.drizzle.delete(logChannel).where(eq(logChannel.channelId, channel.id));
							await i.update({
								content: "Successfully removed logs from this channel.",
								components: [],
							});
							break;
						}
					}
				})
				.catch(client.logger.error);
		} else {
			await interaction.reply({
				content: "This channel is not yet configured. Do you want to configure it?",
				ephemeral: true,
				components: [
					{
						type: ComponentType.ActionRow,
						components: [
							{
								type: ComponentType.Button,
								label: "Yes",
								style: ButtonStyle.Success,
								customId: "configChannel:newChannel:new:yes",
							},
							{
								type: ComponentType.Button,
								label: "No",
								style: ButtonStyle.Danger,
								customId: "configChannel:newChannel:new:no",
							},
						],
					},
				],
			});

			await interaction.channel
				.awaitMessageComponent({
					time: 60_000,
					filter: (i) =>
						i.user.id === interaction.user.id && i.customId.startsWith("configChannel:newChannel:new") && i.isButton(),
				})
				.then(async (i) => {
					await i.deferUpdate();
					if (i.customId === "configChannel:newChannel:yes") {
						if (!i.channel) return;
						await interaction.editReply({
							content: "Which type of logs do you want in that channel.",
							components: [
								{
									type: ComponentType.ActionRow,
									components: [
										{
											type: ComponentType.StringSelect,
											placeholder: "Select a log type",
											custom_id: "configChannel:newChannel:typeSelect",
											max_values: 1,
											min_values: 1,
											options: [
												{
													label: "Moderation",
													description: "Timeout, bans, kicks, etc.",
													value: "mod",
												},
												{
													label: "Server",
													description: "Message updates, Channel updates, etc.",
													value: "server",
												},
											],
										},
									],
								},
							],
						});
						await i.channel
							.awaitMessageComponent({
								time: 60_000,
								filter: (i) =>
									i.user.id === interaction.user.id &&
									i.customId.startsWith("configChannel:newChannel:typeSelect") &&
									i.isStringSelectMenu(),
							})
							.then(async (i) => {
								await i.deferUpdate();
								if (!i.isStringSelectMenu()) return;
								const type = i.values[0] as keyof typeof subscribedLogsSelectOptions;
								const webhookInfo: {
									threadId: string | null;
									webhookId: string;
									webhookToken: string;
								} = {
									webhookId: "",
									webhookToken: "",
									threadId: null,
								};
								if (!channel.parent) return;
								if (!client.user) return;
								let webhook: Webhook;
								if (channel.isThread()) {
									webhook = await channel.parent.createWebhook({
										name: "Watcher",
										avatar: client.user.displayAvatarURL() ?? undefined,
										reason: "New log channel created by " + interaction.user.tag,
									});
									webhookInfo.threadId = channel.id;
								} else {
									webhook = await channel.createWebhook({
										name: "Watcher",
										avatar: client.user.displayAvatarURL() ?? undefined,
										reason: "New log channel created by " + interaction.user.tag,
									});
									webhookInfo.threadId = null;
								}

								webhookInfo.webhookId = webhook.id;
								webhookInfo.webhookToken = webhook.token ?? "";

								await client.drizzle.insert(logChannel).values({
									guildId: interaction.guild.id,
									channelId: channel.id,
									type,
									...webhookInfo,
								});

								await interaction.editReply({
									content:
										// TODO: Add a way to configure the subscribed logs.
										"This channel has been configured. Reuse this command to configure which logs you want to receive.",
									components: [],
								});
							})
							.catch(client.logger.error);
					} else {
						i.update({
							content: "This channel will not be configured.",
							components: [],
						});
					}
				})
				.catch(client.logger.error);
		}
	}
}

/* eslint-disable no-restricted-globals */
/* eslint-disable n/prefer-global/process */
/* eslint-disable unicorn/prefer-module */
import { Buffer } from "node:buffer";
import { resolve } from "node:path";
import { createDrizzleInstance, DrizzleInstance, guildsSettings } from "@sleepymaid/db";
import { HandlerClient } from "@sleepymaid/handler";
import { Logger } from "@sleepymaid/logger";
import type { Config, RequestType, ResponseType } from "@sleepymaid/shared";
import { initConfig, supportedLngs, Queue, RabbitMQConnection } from "@sleepymaid/shared";
import type { Channel, Connection } from "amqplib";
import { GatewayIntentBits } from "discord-api-types/v10";
import { MessagePayload, PermissionFlagsBits } from "discord.js";
import i18next from "i18next";
import FsBackend from "i18next-fs-backend";
import { eq } from "drizzle-orm";

export class SleepyMaidClient extends HandlerClient {
	public declare drizzle: DrizzleInstance;

	public declare mqConnection: Connection;

	public declare channel: Channel;

	public declare config: Config;

	public constructor() {
		super(
			{
				devServerId: "821717486217986098",
			},
			{
				intents: [
					GatewayIntentBits.Guilds,
					GatewayIntentBits.GuildMembers,
					GatewayIntentBits.GuildModeration,
					GatewayIntentBits.GuildVoiceStates,
					GatewayIntentBits.GuildMessages,
					GatewayIntentBits.MessageContent,
				],
				allowedMentions: { parse: ["users", "roles"], repliedUser: false },
			},
		);
	}

	public async start(): Promise<void> {
		this.config = initConfig();
		this.env = this.config.nodeEnv;
		this.logger = new Logger(this.env);

		this.drizzle = createDrizzleInstance(process.env.DATABASE_URL as string);

		const con = RabbitMQConnection.getInstance();
		await con.connect(this.config.rabbitMQUrl);
		this.mqConnection = con.connection;
		if (con.rabbitMQConnected) this.channel = con.channel;

		await i18next.use(FsBackend).init({
			// debug: this.config.environment === 'development',
			supportedLngs,
			backend: {
				loadPath: resolve(__dirname, "../../../../../locales/sleepymaid/{{lng}}/{{ns}}.json"),
			},
			cleanCode: true,
			fallbackLng: "en-US",
			preload: ["en-US", "fr"],
			defaultNS: "translation",
			ns: "translation",
		});

		this.loadHandlers({
			commands: {
				folder: resolve(__dirname, "..", "..", "commands"),
			},
			listeners: {
				folder: resolve(__dirname, "..", "..", "listeners"),
			},
			tasks: {
				folder: resolve(__dirname, "..", "..", "tasks"),
			},
		});

		void this.login(this.config.discordToken);

		if (con.rabbitMQConnected) await this.startRPCListeners();

		process.on("unhandledRejection", (error: Error) => {
			this.logger.error(error);
		});
	}

	private async startRPCListeners(): Promise<void> {
		this.logger.info("Starting RPC listeners");
		await this.channel.assertQueue(Queue.CheckGuildInformation, { durable: false });
		void this.channel.consume(Queue.CheckGuildInformation, async (msg) => {
			if (!msg) {
				return;
			}

			const baseResponse: ResponseType[Queue.CheckGuildInformation] = {
				hasBot: false,
				botNickname: "",
				hasPermission: false,
				userPermissions: "0",
				roles: [],
				channels: [],
				emojis: [],
			};

			const message: RequestType[Queue.CheckGuildInformation] = JSON.parse(msg.content.toString());

			const guild = await this.guilds.fetch(message.guildId);
			const member = await guild.members.fetch(message.userId);
			if (!member || !guild || !this.user) {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			await member.fetch();
			let hasPermission = false;
			if (guild.ownerId === member.id || member.permissions.any(PermissionFlagsBits.ManageGuild, true)) {
				hasPermission = true;
			} else {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			const botMember = await guild.members.fetch(this.user.id);

			const response: ResponseType[Queue.CheckGuildInformation] = {
				hasBot: true,
				hasPermission,
				userPermissions: member.permissions.bitfield.toString(),
				botNickname: botMember?.nickname ?? this.user.username,
				roles: guild.roles.cache.map((role) => ({
					color: role.color.toString(16),
					id: role.id,
					name: role.name,
					position: role.position,
				})),
				channels: guild.channels.cache.map((channel) => ({
					id: channel.id,
					name: channel.name,
				})),
				emojis: guild.emojis.cache
					.map((emoji) => ({
						id: emoji.id,
						name: emoji.name ?? "",
					}))
					.filter((emoji) => emoji.name !== ""),
			};

			return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
				correlationId: msg.properties.correlationId,
			});
		});

		await this.channel.assertQueue(Queue.CheckUserGuildPermissions, { durable: false });
		void this.channel.consume(Queue.CheckUserGuildPermissions, async (msg) => {
			if (!msg) {
				return;
			}

			const baseResponse: ResponseType[Queue.CheckUserGuildPermissions] = {
				admin: false,
				mod: false,
				userPermissions: "0",
			};

			const message: RequestType[Queue.CheckUserGuildPermissions] = JSON.parse(msg.content.toString());

			const guild = await this.guilds.fetch(message.guildId);
			const member = await guild.members.fetch(message.userId);
			if (!member || !guild || !this.user) {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			await member.fetch();

			if (guild.ownerId === member.id) {
				return this.channel.sendToQueue(
					msg.properties.replyTo,
					Buffer.from(
						JSON.stringify({
							admin: true,
							mod: true,
							userPermissions: member.permissions.bitfield.toString(),
						}),
					),
					{
						correlationId: msg.properties.correlationId,
					},
				);
			}

			const guildSettings = await this.drizzle.query.guildsSettings.findFirst({
				where: eq(guildsSettings.guildId, message.guildId),
			});
			if (!guildSettings || !guildSettings.guildId) {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			const adminRoles = guildSettings.adminRoles;
			const modRoles = guildSettings.modRoles;

			const response: ResponseType[Queue.CheckUserGuildPermissions] = {
				admin: adminRoles.length !== 0 && adminRoles.some((role) => member.roles.cache.has(role)),
				mod: modRoles.length !== 0 && modRoles.some((role) => member.roles.cache.has(role)),
				userPermissions: member.permissions.bitfield.toString(),
			};

			return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
				correlationId: msg.properties.correlationId,
			});
		});

		await this.channel.assertQueue(Queue.SendQuickMessage, { durable: false });
		void this.channel.consume(Queue.SendQuickMessage, async (msg) => {
			if (!msg) {
				return;
			}

			const baseResponse: ResponseType[Queue.SendQuickMessage] = {
				messageId: "",
			};

			const message: RequestType[Queue.SendQuickMessage] = JSON.parse(msg.content.toString());
			const messageJson: MessagePayload = JSON.parse(message.messageJson);

			const guild = await this.guilds.fetch(message.guildId);
			if (!guild || !this.user) {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			// Check user permissions
			const member = await guild.members.fetch(message.userId);
			if (!member || !guild || !this.user) {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			const guildSettings = await this.drizzle.query.guildsSettings.findFirst({
				where: eq(guildsSettings.guildId, message.guildId),
			});
			if (!guildSettings || !guildSettings.guildId) {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			await member.fetch();
			let hasPermission = false;

			const adminRoles = guildSettings.adminRoles;

			if (guild.ownerId === member.id) {
				hasPermission = true;
			} else if (member.permissions.any(PermissionFlagsBits.ManageGuild, true)) {
				hasPermission = true;
			} else if (adminRoles.length !== 0 && adminRoles.some((role) => member.roles.cache.has(role))) {
				hasPermission = true;
			}

			if (!hasPermission) {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			const channel = guild.channels.cache.get(message.channelId);
			if (!channel || !channel.isTextBased()) {
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			if (message.messageId) {
				const messageToEdit = await channel.messages.fetch(message.messageId);
				if (!messageToEdit) {
					return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
						correlationId: msg.properties.correlationId,
					});
				}

				await messageToEdit.edit(messageJson);
				return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(baseResponse)), {
					correlationId: msg.properties.correlationId,
				});
			}

			const messageId = await (await channel.send(messageJson)).id;

			const response: ResponseType[Queue.SendQuickMessage] = {
				messageId,
			};

			return this.channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(response)), {
				correlationId: msg.properties.correlationId,
			});
		});
	}
}

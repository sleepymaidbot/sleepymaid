/* eslint-disable no-restricted-globals */
/* eslint-disable n/prefer-global/process */
/* eslint-disable unicorn/prefer-module */
import { Buffer } from "node:buffer";
import { resolve } from "node:path";
import { schema } from "@sleepymaid/db";
import { HandlerClient } from "@sleepymaid/handler";
import { Logger } from "@sleepymaid/logger";
import type {
	CheckGuildInformationRequestMessage,
	CheckGuildInformationResponseMessage,
	Config,
} from "@sleepymaid/shared";
import { initConfig, supportedLngs, mqConnection, Queue } from "@sleepymaid/shared";
import type { Channel, Connection } from "amqplib";
import { ActivityType, GatewayIntentBits } from "discord-api-types/v10";
import { PermissionFlagsBits } from "discord.js";
import { drizzle } from "drizzle-orm/node-postgres";
import i18next from "i18next";
import FsBackend from "i18next-fs-backend";
import { Client } from "pg";

export class SleepyMaidClient extends HandlerClient {
	public declare PGClient: Client;

	public declare drizzle: ReturnType<typeof drizzle<typeof schema>>;

	public declare connection: Connection;

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
				presence: {
					status: "online",
					activities: [
						{
							name: "yo allo ?",
							type: ActivityType.Custom,
						},
					],
				},
			},
		);
	}

	public async start(): Promise<void> {
		this.config = initConfig();
		this.env = this.config.nodeEnv;
		this.logger = new Logger(this.env);

		this.PGClient = new Client({
			connectionString: process.env.DATABASE_URL,
		});
		await this.PGClient.connect();
		this.drizzle = drizzle(this.PGClient, { schema });

		await mqConnection.connect(this.config.rabbitMQUrl);

		this.connection = mqConnection.connection;
		if (mqConnection.rabbitMQConnected) this.channel = await this.connection.createChannel();

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

		await this.loadHandlers({
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
		if (mqConnection.rabbitMQConnected) await this.startRPCListeners();

		void this.login(this.config.discordToken);

		process.on("unhandledRejection", (error: Error) => {
			this.logger.error(error);
		});
	}

	private async startRPCListeners(): Promise<void> {
		await this.channel.assertQueue(Queue.CheckGuildInformation, { durable: false });
		void this.channel.consume(Queue.CheckGuildInformation, async (msg) => {
			if (!msg) {
				return;
			}

			const baseResponse: CheckGuildInformationResponseMessage = {
				hasBot: false,
				botNickname: "",
				hasPermission: false,
				userPermissions: "0",
				roles: [],
				channels: [],
				emojis: [],
			};

			const message: CheckGuildInformationRequestMessage = JSON.parse(msg.content.toString());

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

			const response: CheckGuildInformationResponseMessage = {
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
	}
}

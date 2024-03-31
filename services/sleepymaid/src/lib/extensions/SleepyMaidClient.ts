/* eslint-disable no-restricted-globals */
/* eslint-disable n/prefer-global/process */
/* eslint-disable unicorn/prefer-module */
import { resolve } from 'node:path';
import { PubSubRedisBroker } from '@discordjs/brokers';
import { schema } from '@sleepymaid/db';
import { HandlerClient } from '@sleepymaid/handler';
import { Logger } from '@sleepymaid/logger';
import type { Config } from '@sleepymaid/shared';
import { initConfig, supportedLngs } from '@sleepymaid/shared';
import { ActivityType, GatewayIntentBits } from 'discord-api-types/v10';
import { drizzle } from 'drizzle-orm/node-postgres';
import i18next from 'i18next';
import FsBackend from 'i18next-fs-backend';
import Redis from 'ioredis';
import { Client } from 'pg';

export class SleepyMaidClient extends HandlerClient {
	public declare PGClient: Client;

	public declare drizzle: ReturnType<typeof drizzle<typeof schema>>;

	public declare redis: Redis;

	public declare brokers: PubSubRedisBroker<Redis>;

	public declare config: Config;

	public constructor() {
		super(
			{
				devServerId: '821717486217986098',
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
				allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
				presence: {
					status: 'online',
					activities: [
						{
							name: 'yo allo ?',
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
		this.redis = new Redis(this.config.redisUrl);
		this.brokers = new PubSubRedisBroker({ redisClient: this.redis });

		this.PGClient = new Client({
			connectionString: process.env.DATABASE_URL,
		});
		await this.PGClient.connect();
		this.drizzle = drizzle(this.PGClient, { schema });

		await i18next.use(FsBackend).init({
			// debug: this.config.environment === 'development',
			supportedLngs,
			backend: {
				loadPath: resolve(__dirname, '../../../../../locales/sleepymaid/{{lng}}/{{ns}}.json'),
			},
			cleanCode: true,
			fallbackLng: 'en-US',
			preload: ['en-US', 'fr'],
			defaultNS: 'translation',
			ns: 'translation',
		});

		await this.loadHandlers({
			commands: {
				folder: resolve(__dirname, '..', '..', 'commands'),
			},
			listeners: {
				folder: resolve(__dirname, '..', '..', 'listeners'),
			},
			tasks: {
				folder: resolve(__dirname, '..', '..', 'tasks'),
			},
		});
		void this.login(this.config.discordToken);

		process.on('unhandledRejection', (error: Error) => {
			this.logger.error(error);
		});
	}
}

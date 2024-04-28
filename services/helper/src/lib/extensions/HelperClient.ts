/* eslint-disable n/prefer-global/process */
/* eslint-disable unicorn/prefer-module */
import { resolve } from 'node:path';
import process from 'node:process';
import { schema } from '@sleepymaid/db';
import { HandlerClient } from '@sleepymaid/handler';
import { Logger } from '@sleepymaid/logger';
import type { Config } from '@sleepymaid/shared';
import { initConfig, supportedLngs } from '@sleepymaid/shared';
import { ActivityType, GatewayIntentBits } from 'discord-api-types/v10';
import { drizzle } from 'drizzle-orm/node-postgres';
import i18next from 'i18next';
import FsBackend from 'i18next-fs-backend';
import { Client } from 'pg';

export class HelperClient extends HandlerClient {
	public declare PGClient: Client;

	public declare drizzle: ReturnType<typeof drizzle<typeof schema>>;

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
					GatewayIntentBits.GuildMessages,
					GatewayIntentBits.GuildVoiceStates,
					GatewayIntentBits.MessageContent,
				],
				allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
				presence: {
					status: 'online',
					activities: [
						{
							name: 'you',
							type: ActivityType.Watching,
						},
					],
				},
			},
		);
	}

	public async start(): Promise<void> {
		this.config = initConfig();
		this.logger = new Logger(this.env);
		this.env = this.config.nodeEnv;

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

		void this.loadHandlers({
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

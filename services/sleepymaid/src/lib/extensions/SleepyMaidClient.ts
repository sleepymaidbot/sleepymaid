import { PubSubRedisBroker } from '@discordjs/brokers';
import { Logger } from '@sleepymaid/logger';
import { initConfig, Config, supportedLngs } from '@sleepymaid/shared';
import { PrismaClient } from '@prisma/client';
import { ActivityType, GatewayIntentBits } from 'discord-api-types/v10';
import { HandlerClient } from '@sleepymaid/handler';
import { resolve } from 'path';
import i18next from 'i18next';
import FsBackend from 'i18next-fs-backend';
import Redis from 'ioredis';

export class SleepyMaidClient extends HandlerClient {
	public declare prisma: PrismaClient;
	public declare redis: Redis;
	public declare brokers: PubSubRedisBroker<any>;
	public declare config: Config;
	constructor() {
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
		this.prisma = new PrismaClient();
		this.redis = new Redis(this.config.redisUrl);
		this.brokers = new PubSubRedisBroker({ redisClient: this.redis });

		await i18next.use(FsBackend).init({
			//debug: this.config.environment === 'development',
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
		this.login(this.config.discordToken);

		process.on('unhandledRejection', (error: Error) => {
			this.logger.error(error);
		});

		process.on('exit', async () => {
			//await stopAll(this)
			await this.prisma.$disconnect();
		});
	}
}

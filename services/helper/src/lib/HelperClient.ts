import { Logger } from '@sleepymaid/logger'
import { BaseConfig, ConfigManager } from '@sleepymaid/config'
import { PrismaClient } from '@prisma/client'
import { GatewayIntentBits } from 'discord-api-types/v10'
import { BaseLogger, HandlerClient } from '@sleepymaid/handler'
import { supportedLngs } from '@sleepymaid/localizer'
import { join, resolve } from 'path'
import i18next from 'i18next'
import FsBackend from 'i18next-fs-backend'

export class HelperClient extends HandlerClient {
	public declare prisma: PrismaClient
	public declare configManager: ConfigManager
	public declare config: BaseConfig
	constructor() {
		super(
			{
				devServerId: '821717486217986098',
				logger: new Logger() as unknown as BaseLogger
			},
			{
				intents: [
					GatewayIntentBits.Guilds,
					GatewayIntentBits.GuildMembers,
					GatewayIntentBits.GuildMessages
				],
				allowedMentions: { parse: ['users', 'roles'], repliedUser: false }
			}
		)
	}

	public async start(): Promise<void> {
		this.configManager = new ConfigManager()
		const configs = await this.configManager.initConfig()
		this.config = configs['helper']
		this.prisma = new PrismaClient({
			datasources: { db: { url: this.config.db } }
		})
		this.env = this.config.environment
		await i18next.use(FsBackend).init({
			//debug: this.config.environment === 'development',
			supportedLngs,
			backend: {
				loadPath: join(__dirname, '../../../../../locales/{{lng}}/{{ns}}.json')
			},
			cleanCode: true,
			fallbackLng: 'en-US',
			preload: ['en-US', 'fr'],
			defaultNS: 'translation',
			ns: 'translation'
		})

		this.loadHandlers({
			/*commands: {
				folder: resolve(__dirname, '../slashCommands')
			},*/
			listeners: {
				folder: resolve(__dirname, '../listeners')
			},
			tasks: {
				folder: resolve(__dirname, '../tasks')
			}
		})

		this.login(this.config.token)

		process.on('unhandledRejection', (error: Error) => {
			this.logger.error(error.stack)
		})

		process.on('exit', async () => {
			await this.prisma.$disconnect()
		})
	}
}

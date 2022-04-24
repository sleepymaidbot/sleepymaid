import { Logger } from '@sleepymaid/logger'
import { BaseConfig, ConfigManager } from '@sleepymaid/config'
import { PrismaClient } from '@prisma/client'
import {
	ApplicationCommandPermissionType,
	GatewayIntentBits
} from 'discord-api-types/v10'
import { BaseLogger, HandlerClient } from '@sleepymaid/handler'
import { Localizer } from '@sleepymaid/localizer'
import { resolve } from 'path'

export class BotClient extends HandlerClient {
	public declare prisma: PrismaClient
	public declare localizer: Localizer
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
		this.localizer = new Localizer()
	}

	public async start(): Promise<void> {
		this.configManager = new ConfigManager()
		const configs = await this.configManager.initConfig()
		this.config = configs['helper']
		this.prisma = new PrismaClient({
			datasources: { db: { url: this.config.db } }
		})
		this.localizer.loadLanguage()

		this.loadHandlers({
			/*commands: {
				folder: resolve(__dirname, '../slashCommands')
			},*/
			listeners: {
				folder: resolve(__dirname, '../listeners')
			} /*,
			tasks: {
				folder: resolve(__dirname, '../tasks')
			}*/
		})

		/*this.once('ready', async () => {
			await this.registerApplicationCommandsPermissions()
		})*/
		this.login(this.config.token)
	}

	public async registerApplicationCommandsPermissions(): Promise<void> {
		if (this.config.environment === 'development') {
			const guild = await this.guilds.fetch('324284116021542922')
			const fullPermissions = []
			guild.commands.cache.each((cmd) => {
				fullPermissions.push({
					id: cmd.id,
					permissions: [
						{
							id: '324281236728053760',
							type: ApplicationCommandPermissionType.User,
							permission: true
						},
						{
							id: '946221081251962941',
							type: ApplicationCommandPermissionType.Role,
							permission: true
						},
						{
							id: '324284116021542922',
							type: ApplicationCommandPermissionType.Role,
							permission: false
						}
					]
				})
			})
			await guild.commands.permissions.set({ fullPermissions })
		}
	}
}

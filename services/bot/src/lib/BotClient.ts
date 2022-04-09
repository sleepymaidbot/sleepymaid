import { Logger } from '@sleepymaid/logger'
import { config } from '@sleepymaid/config'
import { PrismaClient } from '@prisma/client'
import {
	ActivityType,
	ApplicationCommandPermissionType,
	GatewayIntentBits
} from 'discord-api-types/v10'
import { HandlerClient } from '@sleepymaid/handler'

export class BotClient extends HandlerClient {
	public declare prisma: PrismaClient
	constructor() {
		super(
			{
				devServerId: '821717486217986098',
				// @ts-ignore - I don't know why this is not working
				logger: new Logger()
			},
			{
				intents: [
					GatewayIntentBits.Guilds,
					GatewayIntentBits.GuildMembers,
					GatewayIntentBits.GuildBans,
					GatewayIntentBits.GuildVoiceStates,
					GatewayIntentBits.GuildMessages
				],
				allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
				presence: {
					status: 'online',
					activities: [
						{
							name: 'yo allo ?',
							type: ActivityType.Watching
						}
					]
				}
			}
		)

		this.prisma = new PrismaClient({ datasources: { db: { url: config.db } } })
	}

	public async registerApplicationCommandsPermissions(): Promise<void> {
		if (config.isDevelopment) {
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

import {
	ApplicationCommandData,
	Client,
	ClientOptions,
	Guild
} from 'discord.js'
import { Logger } from '@sleepymaid-ts/logger'
import { config } from '@sleepymaid-ts/config'
import { resolve } from 'path'
import type {
	botClientCommandsType,
	BotClientOptions,
	guildCommandsType
} from '../types'
import Util from '@sleepymaid-ts/util'
import { PrismaClient } from '@prisma/client'
import { ApplicationCommandPermissionType } from 'discord-api-types/v10'

export class BotClient extends Client {
	public declare botName: string
	public declare logger: Logger
	public declare commandFolder: string
	public declare commands: botClientCommandsType
	public declare eventsFolder: string
	public declare taskFolder: string
	public declare prisma: PrismaClient
	constructor(djsOptions: ClientOptions, options: BotClientOptions) {
		super(djsOptions)

		const { botName, commandFolder, eventsFolder, taskFolder } = options ?? {}

		this.botName = botName ?? 'Bot'
		this.logger = new Logger()
		this.commandFolder = commandFolder ?? '../commands'
		this.commands = {}
		this.eventsFolder = eventsFolder ?? '../listeners'
		this.taskFolder = taskFolder ?? '../tasks'
		this.prisma = new PrismaClient({ datasources: { db: { url: config.db } } })
	}

	public async startAll(): Promise<void> {
		this.login(config.token)
		this.loadEvents()
		this.on('ready', () => {
			this.registerApplicationCommands()
			this.loadTask()
		})
		this.on('interactionCreate', (i) => {
			if (!i.isCommand()) return
			this.handleApplicationCommands(i)
		})
	}

	protected async registerApplicationCommands(): Promise<void> {
		this.logger.info('Registering application commands...')

		const filesToImport = await Util.loadFolder(
			resolve(__dirname, this.commandFolder)
		)

		const globalsCommands: ApplicationCommandData[] = []
		const guildCommands: guildCommandsType = {}

		for (const file of filesToImport) {
			await import(file).then((cmds) => {
				this.commands[cmds.data.name] = file
				if (cmds.guildIds) {
					if (cmds.guildIds.lenght === 1) {
						const guildId = cmds.guildIDs[0]
						if (guildCommands[guildId]) {
							guildCommands[guildId].push(cmds.data)
						} else {
							guildCommands[guildId] = [cmds.data]
						}
					} else {
						for (const id of cmds.guildIds) {
							if (guildCommands[id]) {
								guildCommands[id].push(cmds.data)
							} else {
								guildCommands[id] = [cmds.data]
							}
						}
					}
				} else {
					globalsCommands.push(cmds.data)
				}
			})
		}

		// Global commands
		const applicationCommand = globalsCommands
			.map((cmd) => ({
				name: cmd.name,
				// @ts-ignore - This is a workaround for a bug in the builder
				description: cmd.description,
				// @ts-ignore - This is a workaround for a bug in the builder
				options: cmd.options,
				defaultPermission: cmd.defaultPermission,
				type: cmd.type
			}))
			.sort((a, b) => {
				if (a.name < b.name) return -1
				if (a.name > b.name) return 1
				return 0
			}) as ApplicationCommandData[]
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const currentGlobalCommands = (await this.application?.commands.fetch())!
			.map((value1) => ({
				name: value1.name,
				description: value1.description,
				options: value1.options,
				defaultPermission: value1.defaultPermission,
				type: value1.type
			}))
			.sort((a, b) => {
				if (a.name < b.name) return -1
				if (a.name > b.name) return 1
				return 0
			}) as ApplicationCommandData[]

		if (
			JSON.stringify(applicationCommand) !==
			JSON.stringify(currentGlobalCommands)
		) {
			if (config.isDevelopment) {
				const guild = this.guilds.cache.get('821717486217986098')
				if (!guild) return
				this.logger.info(
					'Global commands have changed, updating...(in dev server)'
				)
				await guild.commands
					.set(globalsCommands)
					.catch((e) => this.logger.error(e))
			}
			this.logger.info('Global commands have changed, updating...')
			await this.application?.commands
				.set(globalsCommands)
				.catch((e) => this.logger.error(e))
		} else {
			this.logger.info('Global commands have not changed.')
		}

		// Guild commands
		if (guildCommands) {
			for (const [key, value] of Object.entries(guildCommands)) {
				const guild = this.guilds.cache.get(key)
				if (!guild) continue

				const sortedCommands = value
					.map((cmd) => ({
						name: cmd.name,
						// @ts-ignore - This is a workaround for a bug in the builder
						description: cmd.description,
						// @ts-ignore - This is a workaround for a bug in the builder
						options: cmd.options,
						defaultPermission: cmd.defaultPermission,
						type: cmd.type
					}))
					.sort((a, b) => {
						if (a.name < b.name) return -1
						if (a.name > b.name) return 1
						return 0
					})

				const currentGuildCommands = (await guild.commands.fetch())
					.map((v1) => ({
						name: v1.name,
						description: v1.description,
						options: v1.options,
						defaultPermission: v1.defaultPermission,
						type: v1.type
					}))
					.sort((a, b) => {
						if (a.name < b.name) return -1
						if (a.name > b.name) return 1
						return 0
					})

				if (
					JSON.stringify(sortedCommands) !==
					JSON.stringify(currentGuildCommands)
				) {
					this.logger.info(
						`Guild commands for ${guild.name} have changed, updating...`
					)
					await guild.commands.set(value).catch((e) => this.logger.error(e))
					this.registerApplicationCommandsPermissions(guild)
				} else {
					this.logger.info(`Guild commands for ${guild.name} have not changed.`)
				}
			}
		}
	}

	protected async registerApplicationCommandsPermissions(
		guild: Guild
	): Promise<void> {
		if (config.isDevelopment) {
			if (guild.id === '324284116021542922') {
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

	protected async handleApplicationCommands(i) {
		this.logger.debug(
			`${i.guild.name} (${i.guild.id}) > ${i.member.user.username} (${i.member.user.id}) > /${i.commandName} (${i.commandId})`
		)
		try {
			const file = this.commands[i.commandName]
			if (!file) return
			const cmd = await import(file)
			await cmd.execute(i, this)
		} catch (error) {
			this.logger.error(error)
			try {
				await i.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true
				})
			} catch (error) {
				try {
					await i.editReply({
						content: 'There was an error while executing this command!'
					})
				} catch (error) {
					this.logger.error(error)
				}
			}
		}
	}

	protected async loadEvents() {
		const filesToImport = await Util.loadFolder(
			resolve(__dirname, this.eventsFolder)
		)

		for (const file of filesToImport) {
			await import(file).then((event) => {
				if (event.once) {
					try {
						this.once(event.name, (...args) => event.execute(...args, this))
					} catch (error) {
						this.logger.error(error)
					}
				} else {
					try {
						this.on(event.name, (...args) => event.execute(...args, this))
					} catch (error) {
						this.logger.error(error)
					}
				}
			})
		}
	}

	protected async loadTask() {
		const filesToImport = await Util.loadFolder(
			resolve(__dirname, this.taskFolder)
		)

		for (const file of filesToImport) {
			await import(file).then((task) => {
				setInterval(() => {
					try {
						task.execute(this)
					} catch (error) {
						this.logger.error(error)
					}
				}, task.interval)
			})
		}
	}
}

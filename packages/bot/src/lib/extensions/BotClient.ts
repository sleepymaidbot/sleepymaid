import { ApplicationCommandData, Client, ClientOptions } from 'discord.js'
import { Logger } from '../logger/logger'
import fs from 'fs'
import { config } from '../../config/config'
import path from 'path'
import type {
	botClientCommandsType,
	BotClientOptions,
	guildCommandsType
} from '../../types'
import Util from '../utils/util'
import { PrismaClient } from '@prisma/client'

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
		this.logger = new Logger(this.botName)
		this.commandFolder = commandFolder ?? '../../commands'
		this.commands = {}
		this.eventsFolder = eventsFolder ?? '../../listeners'
		this.taskFolder = taskFolder ?? '../../tasks'
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

		const slashCommandFiles = fs.readdirSync(
			path.resolve(__dirname, this.commandFolder)
		)

		const filesToImport = []

		async function importFolder(folder, commandFolder) {
			const fsfolder = fs.readdirSync(`${__dirname}/${commandFolder}/${folder}`)
			for (const file of fsfolder) {
				if (file.endsWith('.js')) {
					filesToImport.push(`${folder}/${file}`)
				} else if (file.endsWith('.disable')) return
				else {
					importFolder(`${folder}/${file}`, this.commandFolder)
				}
			}
		}
		for (const file of slashCommandFiles) {
			if (file.endsWith('.js')) {
				filesToImport.push(file)
			} else if (file.endsWith('.disable')) return
			else {
				importFolder(file, this.commandFolder)
			}
		}

		const globalsCommands: ApplicationCommandData[] = []
		const guildCommands: guildCommandsType = {}

		for (const file of filesToImport) {
			await import(`${this.commandFolder}/${file}`).then((cmds) => {
				this.commands[cmds.data.name] = `${this.commandFolder}/${file}`
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

		if (!Util.deepEquals(currentGlobalCommands, applicationCommand)) {
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
				if (!guild) return

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

				if (!Util.deepEquals(sortedCommands, currentGuildCommands)) {
					this.logger.info(
						`Guild commands for ${guild.name} have changed, updating...`
					)
					await guild.commands.set(value).catch((e) => this.logger.error(e))
				} else {
					this.logger.info(`Guild commands for ${guild.name} have not changed.`)
				}
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
		const eventFiles = fs.readdirSync(
			path.resolve(__dirname, this.eventsFolder)
		)

		const filesToImport = []

		async function importFolder(folder, eventsFolder) {
			const fsfolder = fs.readdirSync(
				path.resolve(__dirname, eventsFolder + '/' + folder)
			)
			for (const file of fsfolder) {
				if (file.endsWith('.js')) {
					filesToImport.push(`${folder}/${file}`)
				} else if (file.endsWith('.disable')) return
				else {
					importFolder(`${folder}/${file}`, this.eventsFolder)
				}
			}
		}
		for (const file of eventFiles) {
			if (file.endsWith('.js')) {
				filesToImport.push(file)
			} else if (file.endsWith('.disable')) return
			else {
				importFolder(file, this.eventsFolder)
			}
		}
		for (const file of filesToImport) {
			await import(`${this.eventsFolder}/${file}`).then((event) => {
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
		const tasksFiles = fs
			.readdirSync(path.resolve(__dirname, this.taskFolder))
			.filter((file) => file.endsWith('.js'))
		for (const file of tasksFiles) {
			await import(`${this.taskFolder}/${file}`).then((task) => {
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

import { Client, ClientOptions, Snowflake } from 'discord.js'
import Util from '@sleepymaid-ts/util'
import { Logger } from '@sleepymaid-ts/logger'
import { CommandManager, StartAllOptionsType } from './commands/CommandManager'

export type env = 'development' | 'production'

export interface HandlerClientOptions {
	env?: env
	devServerId: string
}

export interface loadHandlersOptions {
	commands?: StartAllOptionsType
	listeners?: {
		folder: string
	}
	tasks?: {
		folder: string
	}
	modules?: {
		folder: string
		entryFile?: string
		blacklist?: string[]
		whitelist?: string[]
	}
}

export class HandlerClient extends Client {
	public declare logger: Logger
	public declare env: env
	public declare devServerId: Snowflake
	public declare commandManager: CommandManager
	constructor(options: HandlerClientOptions, djsOptions: ClientOptions) {
		super(djsOptions)

		const { env, devServerId } = options ?? {}

		this.logger = new Logger()
		this.env = env ?? 'development'
		this.devServerId = devServerId
		this.commandManager = new CommandManager(this)
	}

	public async loadHandlers(options: loadHandlersOptions): Promise<void> {
		// commands
		if (options.commands) {
			this.commandManager.startAll(options.commands)
		}
		// listeners
		if (options.listeners) {
			this.loadListeners(options.listeners.folder)
		}
		// tasks
		if (options.tasks) {
			this.loadTasks(options.tasks.folder)
		}
	}

	public async loadListeners(folderPath: string): Promise<void> {
		const filesToImport = await Util.loadFolder(folderPath)

		for (const file of filesToImport) {
			const event = await import(file)
			if (event.default.listenerInfo.once) {
				try {
					this.once(
						event.default.listenerInfo.name,
						async (...args) => await event.default.run(this, ...args)
					)
				} catch (error) {
					this.logger.error(error)
				}
			} else {
				try {
					this.on(
						event.default.listenerInfo.name,
						async (...args) => await event.default.run(this, ...args)
					)
				} catch (error) {
					this.logger.error(error)
				}
			}
		}
	}

	public async loadTasks(folderPath: string): Promise<void> {
		const filesToImport = await Util.loadFolder(folderPath)

		for (const file of filesToImport) {
			const task = await import(file)
			setInterval(() => {
				try {
					task.default.run(this)
				} catch (error) {
					this.logger.error(error)
				}
			}, task.default.taskInfo.interval)
		}
	}
}

import { Client, ClientOptions, Snowflake } from 'discord.js'
import { Logger } from '@sleepymaid/logger'
import {
	CommandManager,
	CommandManagerStartAllOptionsType
} from './commands/CommandManager'
import {
	ListenerManager,
	ListenerManagerStartAllOptionsType
} from './listeners/ListenerManager'
import {
	TaskManager,
	TaskManagerStartAllOptionsType
} from './tasks/TaskManager'

export type env = 'development' | 'production'

export interface HandlerClientOptions {
	env?: env
	devServerId: string
}

export interface loadHandlersOptions {
	commands?: CommandManagerStartAllOptionsType
	listeners?: ListenerManagerStartAllOptionsType
	tasks?: TaskManagerStartAllOptionsType
	// TODO: Add modules
	/*modules?: {
		folder: string
		entryFile?: string
		blacklist?: string[]
		whitelist?: string[]
	}*/
}

export class HandlerClient extends Client {
	public declare logger: Logger
	public declare env: env
	public declare devServerId: Snowflake
	public declare commandManager: CommandManager
	public declare listenerManager: ListenerManager
	public declare taskManager: TaskManager
	constructor(options: HandlerClientOptions, djsOptions: ClientOptions) {
		super(djsOptions)

		const { env, devServerId } = options ?? {}

		this.logger = new Logger()
		this.env = env ?? 'development'
		this.devServerId = devServerId
		this.commandManager = new CommandManager(this)
		this.listenerManager = new ListenerManager(this)
		this.taskManager = new TaskManager(this)
	}

	public async loadHandlers(options: loadHandlersOptions): Promise<void> {
		// commands
		if (options.commands) {
			this.commandManager.startAll(options.commands)
		}
		// listeners
		if (options.listeners) {
			this.listenerManager.startAll(options.listeners)
		}
		// tasks
		if (options.tasks) {
			this.taskManager.startAll(options.tasks)
		}
	}
}

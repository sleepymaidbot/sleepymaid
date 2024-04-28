import { Client, ClientOptions } from "discord.js";
import { BaseLogger } from "./BaseLogger";
import { CommandManager, CommandManagerStartAllOptionsType } from "./commands/CommandManager";
import { ListenerManager, ListenerManagerStartAllOptionsType } from "./listeners/ListenerManager";
import { TaskManager, TaskManagerStartAllOptionsType } from "./tasks/TaskManager";

export type env = "dev" | "prod";

export interface HandlerClientOptions {
	env?: env;
	devServerId: string;
	logger?: Logger;
}

export interface loadHandlersOptions {
	commands?: CommandManagerStartAllOptionsType;
	listeners?: ListenerManagerStartAllOptionsType;
	tasks?: TaskManagerStartAllOptionsType;
	// TODO: Add modules
	/*modules?: {
		folder: string
		entryFile?: string
		blacklist?: string[]
		whitelist?: string[]
	}*/
}

export interface Logger {
	info: LogFn;
	debug: LogFn;
	error: ErrorLogFn;
}

export interface LogFn {
	(message: string, ...args: string[]): void;
}

export interface ErrorLogFn {
	(error: Error | string, ...args: string[]): void;
}

export class HandlerClient extends Client {
	public declare logger: Logger;
	public declare env: env;
	public declare commandManager: CommandManager;
	public declare listenerManager: ListenerManager;
	public declare taskManager: TaskManager;
	constructor(options: HandlerClientOptions, djsOptions: ClientOptions) {
		super(djsOptions);

		const { env } = options ?? {};

		this.env = env ?? "dev";
		this.logger = options.logger ?? (new BaseLogger(this.env) as Logger);
		this.commandManager = new CommandManager(this);
		this.listenerManager = new ListenerManager(this);
		this.taskManager = new TaskManager(this);
	}

	public async loadHandlers(options: loadHandlersOptions): Promise<void> {
		// listeners
		if (options.listeners) {
			this.listenerManager.startAll(options.listeners);
		}
		this.once("ready", async () => {
			// commands
			if (options.commands) {
				this.commandManager.startAll(options.commands);
			}
			// tasks
			if (options.tasks) {
				this.taskManager.startAll(options.tasks);
			}
		});
	}
}

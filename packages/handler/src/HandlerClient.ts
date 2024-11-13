import type { ClientOptions } from "discord.js";
import { Client } from "discord.js";
import { BaseLogger } from "./BaseLogger";
import type { CommandManagerStartAllOptionsType } from "./commands/CommandManager";
import { CommandManager } from "./commands/CommandManager";
import type { ListenerManagerStartAllOptionsType } from "./listeners/ListenerManager";
import { ListenerManager } from "./listeners/ListenerManager";
import type { TaskManagerStartAllOptionsType } from "./tasks/TaskManager";
import { TaskManager } from "./tasks/TaskManager";
import { BaseContainer } from "./BaseContainer";

export type env = "dev" | "prod";

export type HandlerClientOptions = {
	devServerId: string;
	env?: env;
	logger?: Logger;
};

export type loadHandlersOptions<Client extends HandlerClient> = {
	commands?: CommandManagerStartAllOptionsType<Client>;
	listeners?: ListenerManagerStartAllOptionsType;
	tasks?: TaskManagerStartAllOptionsType;
	// TODO: Add modules
	/* modules?: {
		folder: string
		entryFile?: string
		blacklist?: string[]
		whitelist?: string[]
	}*/
};

export type Logger = {
	debug: LogFn;
	error: ErrorLogFn;
	info: LogFn;
};

export type LogFn = (message: string, ...args: string[]) => void;

export type ErrorLogFn = (error: Error | string, ...args: string[]) => void;

export class HandlerClient extends Client {
	public declare logger: Logger;

	public declare env: env;

	public declare commandManager?: CommandManager<this>;

	public declare listenerManager?: ListenerManager<this>;

	public declare taskManager?: TaskManager<this>;

	public declare container: BaseContainer<this>;

	public constructor(options: HandlerClientOptions, djsOptions: ClientOptions) {
		super(djsOptions);

		const { env } = options ?? {};

		this.env = env ?? "dev";
		this.logger = options.logger ?? (new BaseLogger(this.env) as Logger);
		this.container = this.container ?? new BaseContainer(this);
	}

	public loadHandlers(options: loadHandlersOptions<this>): void {
		// listeners
		if (options.listeners) {
			this.listenerManager = new ListenerManager(this);
			void this.listenerManager.startAll(options.listeners);
		}

		this.once("ready", () => {
			// commands
			if (options.commands) {
				this.commandManager = new CommandManager(this);
				void this.commandManager.startAll(options.commands);
			}

			// tasks
			if (options.tasks) {
				this.taskManager = new TaskManager(this);
				void this.taskManager.startAll(options.tasks);
			}
		});
	}
}

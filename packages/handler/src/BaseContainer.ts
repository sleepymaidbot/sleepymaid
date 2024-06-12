import type { HandlerClient } from "./HandlerClient";
import type { CommandManager } from "./commands/CommandManager";
import type { ListenerManager } from "./listeners/ListenerManager";
import type { TaskManager } from "./tasks/TaskManager";

export class BaseContainer<Client extends HandlerClient> {
	public client: Client;

	public commandManager: CommandManager;

	public listenerManager: ListenerManager;

	public taskManager: TaskManager;

	public logger: Client["logger"];

	public constructor(client: Client) {
		this.client = client;
		this.commandManager = client.commandManager;
		this.listenerManager = client.listenerManager;
		this.taskManager = client.taskManager;
		this.logger = client.logger;
	}
}

export class Context<Client extends HandlerClient> {
	public container: BaseContainer<Client>;

	public constructor(container: BaseContainer<Client>) {
		this.container = container;
	}
}

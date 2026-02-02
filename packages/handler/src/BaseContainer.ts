import type { CommandManager } from "./commands/CommandManager"
import type { HandlerClient } from "./HandlerClient"
import type { ListenerManager } from "./listeners/ListenerManager"
import type { TaskManager } from "./tasks/TaskManager"

export class BaseContainer<Client extends HandlerClient> {
	public client: Client

	public commandManager?: CommandManager<Client>

	public listenerManager?: ListenerManager<Client>

	public taskManager?: TaskManager<Client>

	public logger: Client["logger"]

	public constructor(client: Client) {
		this.client = client
		this.commandManager = client.commandManager
		this.listenerManager = client.listenerManager
		this.taskManager = client.taskManager
		this.logger = client.logger
	}
}

export class Context<Client extends HandlerClient> {
	public container: Client["container"]

	public constructor(container: Client["container"]) {
		this.container = container
	}
}

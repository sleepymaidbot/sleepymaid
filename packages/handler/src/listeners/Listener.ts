import type { Awaitable, ClientEvents } from "discord.js"
import type { Context } from "../BaseContainer"
import type { HandlerClient } from "../HandlerClient"

export class Listener<Event extends keyof ClientEvents, Client extends HandlerClient> {
	public container: Client["container"]

	public name: keyof ClientEvents

	public once: boolean

	public constructor(context: Context<Client>, options: ListenerOptions = {} as ListenerOptions) {
		this.container = context.container
		this.name = options.name
		this.once = options.once ?? false
	}

	public execute?(...args: ClientEvents[Event]): Awaitable<unknown>
}

export type ListenerOptions = {
	name: keyof ClientEvents
	once?: boolean
}

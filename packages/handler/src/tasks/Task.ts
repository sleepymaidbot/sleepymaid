import type { Awaitable } from "discord.js"
import type { Context } from "../BaseContainer"
import type { HandlerClient } from "../HandlerClient"

export class Task<Client extends HandlerClient> {
	public interval: string

	public runOnStart: boolean

	public container: Client["container"]

	public constructor(context: Context<Client>, options: TaskOptions) {
		this.container = context.container
		this.interval = options.interval
		this.runOnStart = options.runOnStart ?? false
	}

	public execute?(): Awaitable<unknown>
}

export type TaskOptions = {
	interval: string
	runOnStart?: boolean
}

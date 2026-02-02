import type {
	Awaitable,
	ChatInputCommandInteraction,
	MessageContextMenuCommandInteraction,
	UserContextMenuCommandInteraction,
} from "discord.js"
import type { Context } from "../BaseContainer"
import type { HandlerClient } from "../HandlerClient"

export class Precondition<Client extends HandlerClient> {
	public container: Client["container"]

	public constructor(context: Context<Client>) {
		this.container = context.container
	}

	public CommandRun?(
		interaction:
			| ChatInputCommandInteraction<`cached`>
			| MessageContextMenuCommandInteraction<`cached`>
			| UserContextMenuCommandInteraction<`cached`>,
	): Awaitable<unknown>
}

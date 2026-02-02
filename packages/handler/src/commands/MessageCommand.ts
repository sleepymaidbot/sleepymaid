import type { Awaitable, MessageApplicationCommandData, MessageContextMenuCommandInteraction } from "discord.js"
import type { Context } from "../BaseContainer"
import type { HandlerClient } from "../HandlerClient"
import type { CommandOptions } from "./Command"
import { Command } from "./Command"

export class MessageCommand<Client extends HandlerClient> extends Command<Client> {
	public declare data: MessageApplicationCommandData

	public constructor(context: Context<Client>, options: MessageCommandOptions<Client>) {
		super(context, options)
		this.data = options.data
	}

	public override execute?(interaction: MessageContextMenuCommandInteraction): Awaitable<unknown>
}

export type MessageCommandOptions<Client extends HandlerClient> = CommandOptions<Client> & {
	data: MessageApplicationCommandData
}

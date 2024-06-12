import type { Awaitable, UserApplicationCommandData, UserContextMenuCommandInteraction } from "discord.js";
import type { Context } from "../BaseContainer";
import type { HandlerClient } from "../HandlerClient";
import type { CommandOptions } from "./Command";
import { Command } from "./Command";

export class UserCommand<Client extends HandlerClient> extends Command<Client> {
	public declare data: UserApplicationCommandData;

	public constructor(context: Context<Client>, options: UserCommandOptions) {
		super(context, options);
		this.data = options.data;
	}

	public override execute?(interaction: UserContextMenuCommandInteraction<`cached`>): Awaitable<unknown>;
}

export type UserCommandOptions = CommandOptions & {
	data: UserApplicationCommandData;
};

import type {
	AutocompleteInteraction,
	Awaitable,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
} from "discord.js";
import type { Context } from "../BaseContainer";
import type { HandlerClient } from "../HandlerClient";
import type { CommandOptions } from "./Command";
import { Command } from "./Command";

export class SlashCommand<Client extends HandlerClient> extends Command<Client> {
	declare public data: ChatInputApplicationCommandData;

	public constructor(context: Context<Client>, options: SlashCommandOptions<Client>) {
		super(context, options);
		this.data = options.data;
	}

	public override execute?(interaction: ChatInputCommandInteraction): Awaitable<unknown>;

	public autocomplete?(interaction: AutocompleteInteraction): Awaitable<unknown>;
}

export type SlashCommandOptions<Client extends HandlerClient> = CommandOptions<Client> & {
	data: ChatInputApplicationCommandData;
};

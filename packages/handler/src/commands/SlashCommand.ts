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
	public declare data: ChatInputApplicationCommandData;

	public constructor(context: Context<Client>, options: SlashCommandOptions) {
		super(context, options);
		this.data = options.data;
	}

	public override execute?(interaction: ChatInputCommandInteraction<`cached`>): Awaitable<unknown>;

	public autocomplete?(interaction: AutocompleteInteraction): Awaitable<unknown>;
}

export type SlashCommandOptions = CommandOptions & {
	data: ChatInputApplicationCommandData;
};

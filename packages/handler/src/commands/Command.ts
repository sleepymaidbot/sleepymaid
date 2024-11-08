import type {
	Awaitable,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	MessageApplicationCommandData,
	MessageContextMenuCommandInteraction,
	Snowflake,
	UserApplicationCommandData,
	UserContextMenuCommandInteraction,
} from "discord.js";
import type { BaseContainer, Context } from "../BaseContainer";
import type { HandlerClient } from "../HandlerClient";
import type { Precondition } from "../preconditions/Precondition";

export type CommandInteractionTypeUnion =
	| ChatInputCommandInteraction
	| MessageContextMenuCommandInteraction
	| UserContextMenuCommandInteraction;

export class Command<Client extends HandlerClient> {
	public data!: ChatInputApplicationCommandData | MessageApplicationCommandData | UserApplicationCommandData;

	public guildIds?: Snowflake[];

	public container: BaseContainer<Client>;

	public preconditions?: (typeof Precondition<Client>)[];

	public constructor(context: Context<Client>, options: CommandOptions<Client>) {
		this.container = context.container;
		this.guildIds = options.guildIds;
		this.preconditions = options.preconditions;
	}

	public execute?(interaction: CommandInteractionTypeUnion): Awaitable<unknown>;
}

export type CommandOptions<Client extends HandlerClient> = {
	data: ChatInputApplicationCommandData | MessageApplicationCommandData | UserApplicationCommandData;
	guildIds?: Snowflake[];
	preconditions?: (typeof Precondition<Client>)[];
};

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

export class Command<Client extends HandlerClient> {
	public data!: ChatInputApplicationCommandData | MessageApplicationCommandData | UserApplicationCommandData;

	public guildIds?: Snowflake[];

	public container: BaseContainer<Client>;

	public constructor(context: Context<Client>, options: CommandOptions) {
		this.container = context.container;
		this.guildIds = options.guildIds;
	}

	public execute?(
		interaction:
			| ChatInputCommandInteraction<`cached`>
			| MessageContextMenuCommandInteraction<`cached`>
			| UserContextMenuCommandInteraction<`cached`>,
	): Awaitable<unknown>;
}

export type CommandOptions = {
	data: ChatInputApplicationCommandData | MessageApplicationCommandData | UserApplicationCommandData;
	guildIds?: Snowflake[];
};

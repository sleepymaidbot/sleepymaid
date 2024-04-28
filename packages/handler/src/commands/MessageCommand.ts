import type { MessageApplicationCommandData, MessageContextMenuCommandInteraction, Snowflake } from "discord.js";
import type { HandlerClient } from "../HandlerClient";

export interface MessageCommandInterface {
	data: MessageApplicationCommandData;
	guildIds?: Snowflake[];
	execute: (
		interaction: MessageContextMenuCommandInteraction<`cached`>,
		client: HandlerClient,
	) => unknown | Promise<unknown>;
}

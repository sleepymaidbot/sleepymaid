import type {
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	Snowflake,
} from 'discord.js';
import { HandlerClient } from '../HandlerClient';

export interface SlashCommandInterface {
	data: ChatInputApplicationCommandData;
	guildIds?: Snowflake[];
	execute: (interaction: ChatInputCommandInteraction<`cached`>, client: HandlerClient) => unknown | Promise<unknown>;
	autocomplete?: (interaction: AutocompleteInteraction, client: HandlerClient) => unknown | Promise<unknown>;
}

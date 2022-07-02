import type {
	Snowflake,
	UserApplicationCommandData,
	UserContextMenuCommandInteraction
} from 'discord.js'
import { HandlerClient } from '../HandlerClient'

export interface UserCommandInterface {
	data: UserApplicationCommandData
	guildIds?: Snowflake[]
	execute: (
		interaction: UserContextMenuCommandInteraction<`cached`>,
		client: HandlerClient
	) => unknown | Promise<unknown>
}

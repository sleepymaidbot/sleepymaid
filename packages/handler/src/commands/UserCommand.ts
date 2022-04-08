import {
	Snowflake,
	UserApplicationCommandData,
	UserContextMenuCommandInteraction
} from 'discord.js'
import { HandlerClient } from '../HandlerClient'

export type UserCommandInfo = {
	guildIds: Snowflake[]
	data: UserApplicationCommandData
}

export type UserCommandRunFunction = (
	interaction: UserContextMenuCommandInteraction,
	client: HandlerClient
) => void

export type UserCommandFunctionType = {
	run: UserCommandRunFunction
}

export class UserCommand {
	commandInfo: UserCommandInfo
	constructor(
		commandInfo: UserCommandInfo,
		functions: UserCommandFunctionType
	) {
		this.commandInfo = commandInfo
		this.run = functions.run
	}

	run(interaction: UserContextMenuCommandInteraction, _client: HandlerClient) {
		interaction.reply({
			content: "This interaction isn't implemented yet",
			ephemeral: true
		})
	}
}

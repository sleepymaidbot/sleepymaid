import {
	MessageApplicationCommandData,
	MessageContextMenuCommandInteraction,
	Snowflake
} from 'discord.js'
import { HandlerClient } from '../HandlerClient'

export type UserCommandInfo = {
	guilIds: Snowflake[]
	data: MessageApplicationCommandData
}

export type UserCommandRunFunction = (
	interaction: MessageContextMenuCommandInteraction,
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

	run(
		interaction: MessageContextMenuCommandInteraction,
		_client: HandlerClient
	) {
		interaction.reply({
			content: "This interaction isn't implemented yet",
			ephemeral: true
		})
	}
}

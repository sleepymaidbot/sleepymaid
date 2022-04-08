import {
	MessageApplicationCommandData,
	MessageContextMenuCommandInteraction,
	Snowflake
} from 'discord.js'
import { HandlerClient } from '../HandlerClient'

export type MessageCommandInfo = {
	guildIds: Snowflake[]
	data: MessageApplicationCommandData
}

export type MessageCommandRunFunction = (
	interaction: MessageContextMenuCommandInteraction,
	client: HandlerClient
) => void

export type MessageCommandFunctionType = {
	run: MessageCommandRunFunction
}

export class MessageCommand {
	commandInfo: MessageCommandInfo
	constructor(
		commandInfo: MessageCommandInfo,
		functions: MessageCommandFunctionType
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

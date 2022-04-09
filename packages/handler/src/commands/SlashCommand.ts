/* eslint-disable @typescript-eslint/no-unused-vars */
import 'reflect-metadata'
import { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AutocompleteInteraction,
	ChatInputApplicationCommandData,
	CommandInteraction,
	Snowflake
} from 'discord.js'
import { HandlerClient } from '../HandlerClient'

export type SlashCommandInfo = {
	guildIds?: Snowflake[]
	data: ChatInputApplicationCommandData
}

export type CommandRunFunction = (
	interaction: CommandInteraction,
	client: HandlerClient
) => void

export type AutoCompleteFunction = (
	interaction: AutocompleteInteraction,
	client: HandlerClient
) => void

export type SlashCommandFunctionType = {
	run: CommandRunFunction
	autocomplete?: AutoCompleteFunction
}

export class SlashCommand {
	commandInfo: SlashCommandInfo
	constructor(
		commandInfo: SlashCommandInfo,
		functions: SlashCommandFunctionType
	) {
		this.commandInfo = commandInfo
		this.run = functions.run
		if ('autocomplete' in functions) this.autocomplete = functions.autocomplete
	}

	run(interaction: CommandInteraction, _client: HandlerClient) {
		interaction.reply({
			content: "This interaction isn't implemented yet",
			ephemeral: true
		})
	}

	autocomplete(interaction: AutocompleteInteraction, _client: HandlerClient) {
		interaction.respond([
			{
				name: "This interaction isn't implemented yet",
				value: 'error'
			}
		])
	}
}

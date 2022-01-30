import { ApplicationCommandData, Snowflake } from 'discord.js'

export interface BotClientOptions {
	botName: string
	commandFolder?: string
	eventsFolder?: string
	taskFolder?: string
}

export interface botClientCommandsType {
	[key: string]: string
}

export interface guildCommandsType {
	[key: Snowflake]: ApplicationCommandData[]
}

/* eslint-disable @typescript-eslint/no-var-requires */
import { BotClient } from './lib/extensions/BotClient'
import { config } from './config/config'
import { Intents } from 'discord.js'
import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import fs from 'fs'
import { startDB } from './lib/utils/db'

const lmeCommandFiles = fs
	.readdirSync('./dist/lmeCommands')
	.filter((file) => file.endsWith('.js'))
const eventFiles = fs
	.readdirSync('./dist/listeners')
	.filter((file) => file.endsWith('.js'))
const tasksFiles = fs
	.readdirSync('./dist/tasks')
	.filter((file) => file.endsWith('.js'))

const lmeCommands = new Map()
const lmeCommand = []

const myIntents = new Intents([
	'GUILDS',
	'GUILD_MEMBERS',
	'GUILD_BANS',
	'GUILD_VOICE_STATES',
	'GUILD_MESSAGES'
])

const client: BotClient = new BotClient({
	intents: myIntents,
	presence: {
		status: 'online',
		activities: [
			{
				name: 'yo allo ?',
				type: 'WATCHING'
			}
		]
	}
})

for (const file of lmeCommandFiles) {
	const command = require(`./dist/lmeCommands/${file}`)
	lmeCommands.set(command.data.name, command.data.toJSON())
	lmeCommand.push(command.data.toJSON())
}

for (const file of eventFiles) {
	const event = require(`./dist/listeners/${file}`)
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client))
	} else {
		client.on(event.name, (...args) => event.execute(...args, client))
	}
}

for (const file of tasksFiles) {
	const task = require(`./dist/tasks/${file}`)
	setInterval(() => task.execute(client), task.interval)
}

client.once('ready', async () => {
	await startDB()
		.catch((err) => client.logger.error(err))
		.then(() => client.logger.info('Successfully loaded MongoDB.'))
	await client.logger.info(
		`Logged in as ${client.user.tag} | ${client.guilds.cache.size} servers`
	)
})

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return
	if (
		lmeCommands.has(interaction.commandName) &&
		interaction.guild.id === '324284116021542922'
	) {
		client.logger.debug(
			`${interaction.guild.name} (${interaction.guild.id}) > ${interaction.member.user.username} (${interaction.member.user.id}) > /${interaction.commandName} (${interaction.commandId})`
		)
		try {
			const command = require(`./dist/lmecommands/${interaction.commandName}.js`)
			await command.execute(interaction, client)
		} catch (error) {
			client.logger.error(error)
			await interaction.reply({
				content: 'There was an error while executing this command!',
				ephemeral: true
			})
		}
	}
})

const rest = new REST({ version: '9' }).setToken(config.token)

;(async () => {
	try {
		client.logger.info('Started refreshing application (/) commands.')

		await rest.put(
			Routes.applicationGuildCommands(
				config.envClientId,
				'324284116021542922'
			),
			{ body: lmeCommand }
		)

		client.logger.info('Successfully reloaded application (/) commands.')
	} catch (error) {
		console.error(error)
	}
})()
;(async () => {
	client.login(config.token)
})()

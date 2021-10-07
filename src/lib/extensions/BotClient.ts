import { Client, Collection, Intents, Options } from 'discord.js'
import { Logger } from '../logger/logger'
import fs from 'fs'
import { REST } from '@discordjs/rest'
import { config } from '../../config/config'
import { Routes } from 'discord-api-types/v9'
import { connect } from 'mongoose'

export class BotClient extends Client {
	logger: Logger
	constructor() {
		super({
			intents: new Intents([
				'GUILDS',
				'GUILD_MEMBERS',
				'GUILD_BANS',
				'GUILD_VOICE_STATES',
				'GUILD_MESSAGES'
			]),
			allowedMentions: { parse: ['users', 'roles'], repliedUser: false },
			presence: {
				status: 'online',
				activities: [
					{
						name: 'yo allo ?',
						type: 'WATCHING'
					}
				]
			}/*,
			makeCache: Options.cacheWithLimits({
				GuildMemberManager: 0,
			})*/
		})
		this.logger = new Logger('Sleepy Maid')
	}

	public async startBot() {
		this.loadEvents()
		this.loadDB()
		this.login(config.token)
		this.loadTasks()
		this.loadCommands()
	}

	private async loadCommands() {
		const lmeCommandFiles = fs
			.readdirSync('./dist/lmeCommands')
			.filter((file) => file.endsWith('.js'))

		const lmeCommands = new Collection()

		for (const file of lmeCommandFiles) {
			await import(`../../lmeCommands/${file}`).then((command) => {
				lmeCommands.set(command.data.name, command.data.toJSON())
			})
		}

		try {
			const lmeCommand = await lmeCommands.map(({ ...data }) => data)
			const rest = new REST({ version: '9' }).setToken(config.token)
			this.logger.info('Started refreshing application (/) commands.')

			await rest.put(
				Routes.applicationGuildCommands(
					config.envClientId,
					'324284116021542922'
				),
				{ body: lmeCommand }
			)

			this.logger.info('Successfully reloaded application (/) commands.')
		} catch (error) {
			this.logger.error(error)
		}

		this.on('interactionCreate', async (interaction) => {
			if (!interaction.isCommand()) return
			if (
				lmeCommands.has(interaction.commandName) &&
				interaction.guild.id === '324284116021542922'
			) {
				this.logger.debug(
					`${interaction.guild.name} (${interaction.guild.id}) > ${interaction.member.user.username} (${interaction.member.user.id}) > /${interaction.commandName} (${interaction.commandId})`
				)
				try {
					const command = await import(
						`../../lmeCommands/${interaction.commandName}.js`
					)
					await command.execute(interaction, this)
				} catch (error) {
					this.logger.error(error)
					await interaction.reply({
						content: 'There was an error while executing this command!',
						ephemeral: true
					})
				}
			}
		})
	}

	private async loadEvents() {
		const eventFiles = fs
			.readdirSync('./dist/listeners')
			.filter((file) => file.endsWith('.js'))
		for (const file of eventFiles) {
			await import(`../../listeners/${file}`).then((event) => {
				if (event.once) {
					this.once(event.name, (...args) => event.execute(...args, this))
				} else {
					this.on(event.name, (...args) => event.execute(...args, this))
				}
			})
		}
	}

	private async loadTasks() {
		const tasksFiles = fs
			.readdirSync('./dist/tasks')
			.filter((file) => file.endsWith('.js'))
		for (const file of tasksFiles) {
			await import(`../../tasks/${file}`).then((task) => {
				setInterval(() => task.execute(this), task.interval)
			})
		}
	}

	private async loadDB() {
		await connect(config.db)
			.catch((err) => this.logger.error(err))
			.then(() => this.logger.info('Successfully loaded MongoDB.'))
	}
}

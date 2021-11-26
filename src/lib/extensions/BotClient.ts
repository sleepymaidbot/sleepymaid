import { Client, Collection, Intents } from 'discord.js'
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
			} /*,
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
		const slashCommandFiles = fs.readdirSync('./dist/slashCommands')

		const filesToImport = []

		async function importFolder(folder) {
			const fsfolder = fs.readdirSync(`./dist/slashCommands/${folder}`)
			for (const file of fsfolder) {
				if (file.endsWith('.js')) {
					filesToImport.push(`${folder}/${file}`)
				} else if (file.endsWith('.disable')) return
				else {
					importFolder(`${folder}/${file}`)
				}
			}
		}
		for (const file of slashCommandFiles) {
			if (file.endsWith('.js')) {
				filesToImport.push(file)
			} else if (file.endsWith('.disable')) return
			else {
				importFolder(file)
			}
		}

		const globalsCommands = []
		const guildCommands = {}
		const cmdsForLocation = {}

		for (const file of filesToImport) {
			await import(`../../slashCommands/${file}`).then((cmds) => {
				cmdsForLocation[cmds.data.name] = `../../slashCommands/${file}`
				if (cmds.guildIDs !== null) {
					if (cmds.guildIDs.lenght <=1) {
						const guildID = cmds.guildIDs[0]
						if (guildCommands[guildID]) {
							guildCommands[guildID].push(cmds.data)
						} else {
							guildCommands[guildID] = [cmds.data]
						}
					} else {
						for (const id of cmds.guildIDs) {
							if (guildCommands[id]) {
								guildCommands[id].push(cmds.data)
							} else {
								guildCommands[id] = [cmds.data]
							}
						}
					}
				} else {
					globalsCommands.push(cmds.data)
				}
			})
		}

		try {
			const rest = new REST({ version: '9' }).setToken(config.token)
			this.logger.info('Started refreshing application (/) commands.')

			if (globalsCommands.length >= 1) await rest.put(Routes.applicationCommands(config.envClientId), { body: globalsCommands })

			for (const [key, value] of Object.entries(guildCommands)) {
				await rest.put(Routes.applicationGuildCommands(config.envClientId, key), { body: value })
			}

			this.logger.info('Successfully reloaded application (/) commands.')
		} catch (error) {
			this.logger.error(error)
		}

		this.on('interactionCreate', async (i) => {
			if (!i.isCommand()) return
			this.logger.debug(
				`${i.guild.name} (${i.guild.id}) > ${i.member.user.username} (${i.member.user.id}) > /${i.commandName} (${i.commandId})`
			)
			try {
				const file = cmdsForLocation[i.commandName]
				if (!file) return
				const cmd = await import(file)
				await cmd.execute(i, this)
			} catch (error) {
				this.logger.error(error)
				await i.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true
				})
			}
			
		})
	}

	private async loadEvents() {
		const eventFiles = fs.readdirSync('./dist/listeners')

		const filesToImport = []

		async function importFolder(folder) {
			const fsfolder = fs.readdirSync(`./dist/listeners/${folder}`)
			for (const file of fsfolder) {
				if (file.endsWith('.js')) {
					filesToImport.push(`${folder}/${file}`)
				} else if (file.endsWith('.disable')) return
				else {
					importFolder(`${folder}/${file}`)
				}
			}
		}
		for (const file of eventFiles) {
			if (file.endsWith('.js')) {
				filesToImport.push(file)
			} else if (file.endsWith('.disable')) return
			else {
				importFolder(file)
			}
		}
		for (const file of filesToImport) {
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

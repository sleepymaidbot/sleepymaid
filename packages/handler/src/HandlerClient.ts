import 'reflect-metadata'
import {
	ApplicationCommandData,
	AutocompleteInteraction,
	ButtonInteraction,
	Client,
	ClientOptions,
	Collection,
	CommandInteraction,
	ContextMenuCommandInteraction,
	Interaction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	Snowflake
} from 'discord.js'
import Util from '@sleepymaid-ts/util'
import { Logger } from '@sleepymaid-ts/logger'
import { readdir } from 'fs/promises'
import { join } from 'path'

export interface ClientCommandsType {
	[key: string]: string
}

export type env = 'development' | 'production'

export interface HandlerClientOptions {
	env?: env
	devServerId: string
}

export interface GuildCommandsType {
	[key: Snowflake]: ApplicationCommandData[]
}

export interface loadHandlersOptions {
	commands?: {
		folder: string
		extraGlobalCommands?: Array<ApplicationCommandData>
		extraGuildCommands?: GuildCommandsType
	}
	listeners?: {
		folder: string
	}
	tasks?: {
		folder: string
	}
	modules?: {
		folder: string
		entryFile?: string
		blacklist?: string[]
		whitelist?: string[]
	}
}
export type loadCommandsReturnType = {
	globalCommands: ApplicationCommandData[]
	guildCommands: Collection<string, ApplicationCommandData[]>
}

export class HandlerClient extends Client {
	public declare logger: Logger
	public declare commands: Collection<string, string>
	public declare env: env
	public declare devServerId: Snowflake
	constructor(options: HandlerClientOptions, djsOptions: ClientOptions) {
		super(djsOptions)

		const { env, devServerId } = options ?? {}

		this.logger = new Logger()
		this.commands = new Collection<string, string>()
		this.env = env ?? 'development'
		this.devServerId = devServerId
	}

	public async loadHandlers(options: loadHandlersOptions): Promise<void> {
		// commands
		if (options.commands) {
			this.loadCommands(
				options.commands.folder,
				options.commands.extraGlobalCommands,
				options.commands.extraGuildCommands
			)
		}
		// listeners
		if (options.listeners) {
			this.loadListeners(options.listeners.folder)
		}
		// tasks
		if (options.tasks) {
			this.loadTasks(options.tasks.folder)
		}
	}

	public async loadCommands(
		folderPath: string,
		extraGlobalCommands?: Array<ApplicationCommandData>,
		extraGuildCommands?: GuildCommandsType
	): Promise<void> {
		this.logger.info('Registering application commands...')
		const topLevelFolders = await readdir(folderPath)
		const globalCommands: ApplicationCommandData[] = [
			...(extraGlobalCommands ?? [])
		]
		const guildCommands = new Collection<Snowflake, ApplicationCommandData[]>()
		for (const [key, value] of Object.entries(extraGuildCommands ?? {}))
			guildCommands.set(key, value)

		for (const folderName of topLevelFolders) {
			switch (folderName) {
				case 'chat': {
					const data = await this.loadChatCommands(join(folderPath, folderName))
					globalCommands.push(...data.globalCommands)
					data.guildCommands.forEach((value, key) => {
						const array = guildCommands.get(key) ?? []
						array.push(...value)
						guildCommands.set(key, array)
					})
					break
				}
				case 'message': {
					// TODO: Implement message commands
					break
				}
				case 'user': {
					// TODO: Implement user commands
					break
				}
			}
		}
		await this.RegisterApplicationCommands(globalCommands, guildCommands)
		this.on('interactionCreate', (i: Interaction) =>
			this.HandleInteractionEvent(i)
		)
	}

	private HandleInteractionEvent(i: Interaction) {
		if (i.isCommand()) {
			this.HandleChatApplicationCommands(i as CommandInteraction)
			this.emit('commandRun', i)
		} else if (i.isSelectMenu()) {
			this.emit('selectChanged', i as SelectMenuInteraction)
		} else if (i.isButton()) {
			this.emit('buttonClicked', i as ButtonInteraction)
		} else if (i.isModalSubmit()) {
			this.emit('modalSubmit', i as ModalSubmitInteraction)
		} else if (i.isContextMenuCommand()) {
			// this.HandleContextMenuCommand(i as ContextMenuCommandInteraction)
			this.emit('contextMenuRun', i as ContextMenuCommandInteraction)
		} else if (i.isAutocomplete) {
			this.HandleAutocomplete(i as AutocompleteInteraction)
			this.emit('autocomplete', i as AutocompleteInteraction)
		}
	}

	private async loadChatCommands(
		folderPath: string
	): Promise<loadCommandsReturnType> {
		const globalCommands: ApplicationCommandData[] = []
		const guildCommands = new Collection<Snowflake, ApplicationCommandData[]>()
		const filesToImport = await Util.loadFolder(folderPath)

		for (const file of filesToImport) {
			const cmds = await import(file)
			this.commands[cmds.default.commandInfo.data.name] = file
			if (cmds.default.commandInfo.guildIds) {
				for (const id of cmds.default.commandInfo.guildIds) {
					const array = guildCommands.get(id) ?? []
					array.push(cmds.default.commandInfo.data)
					guildCommands.set(id, array)
				}
			} else {
				globalCommands.push(cmds.default.commandInfo.data)
			}
		}

		return {
			globalCommands,
			guildCommands
		}
	}

	private async RegisterApplicationCommands(
		globalCommands: ApplicationCommandData[],
		guildCommands: Collection<Snowflake, ApplicationCommandData[]>
	) {
		// Global commands
		const applicationCommand = globalCommands.sort((a, b) => {
			if (a.name < b.name) return -1
			if (a.name > b.name) return 1
			return 0
		}) as ApplicationCommandData[]
		const currentGlobalCommands =
			(await this.application?.commands.fetch()) ??
			([].sort((a, b) => {
				if (a.name < b.name) return -1
				if (a.name > b.name) return 1
				return 0
			}) as ApplicationCommandData[])

		if (
			JSON.stringify(applicationCommand) !==
			JSON.stringify(currentGlobalCommands)
		) {
			if (this.env === 'development') {
				const guild = this.guilds.cache.get(this.devServerId)
				if (!guild) return
				this.logger.info(
					'Global commands have changed, updating...(in dev server)'
				)
				await guild.commands
					.set(globalCommands)
					.catch((e) => this.logger.error(e))
				await this.application?.commands.set([])
			} else {
				this.logger.info('Global commands have changed, updating...')
				await this.application?.commands
					.set(globalCommands)
					.catch((e) => this.logger.error(e))
			}
		} else {
			this.logger.info('Global commands have not changed.')
		}

		// Guild commands
		if (guildCommands) {
			guildCommands.forEach(async (value, key) => {
				const guild = this.guilds.cache.get(key)
				if (!guild) return

				const sortedCommands = value.sort((a, b) => {
					if (a.name < b.name) return -1
					if (a.name > b.name) return 1
					return 0
				})

				const currentGuildCommands = (await guild.commands.fetch()).sort(
					(a, b) => {
						if (a.name < b.name) return -1
						if (a.name > b.name) return 1
						return 0
					}
				)

				if (
					JSON.stringify(sortedCommands) !==
					JSON.stringify(currentGuildCommands)
				) {
					this.logger.info(
						`Guild commands for ${guild.name} have changed, updating...`
					)
					await guild.commands.set(value).catch((e) => this.logger.error(e))
				} else {
					this.logger.info(`Guild commands for ${guild.name} have not changed.`)
				}
			})
		}
	}

	private async HandleChatApplicationCommands(i: CommandInteraction) {
		this.logger.info(
			`${i.guild.name} (${i.guild.id}) > ${i.member.user.username} (${i.member.user.id}) > /${i.commandName} (${i.commandId})`
		)
		try {
			const file = this.commands[i.commandName]
			if (!file) return
			const cmd = await import(file)
			await cmd.default.run(i, this)
		} catch (error) {
			this.logger.error(error)
			try {
				await i.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true
				})
			} catch (error) {
				try {
					await i.editReply({
						content: 'There was an error while executing this command!'
					})
				} catch (error) {
					this.logger.error(error)
				}
			}
		}
	}

	private async HandleAutocomplete(i: AutocompleteInteraction) {
		try {
			const file = this.commands[i.commandName]
			if (!file) return
			const cmd = await import(file)
			await cmd.default.autocomplete(i, this)
		} catch (error) {
			this.logger.error(error)
			try {
				/*await i.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true
				})*/
			} catch (error) {
				try {
					/*await i.editReply({
						content: 'There was an error while executing this command!'
					})*/
				} catch (error) {
					this.logger.error(error)
				}
			}
		}
	}

	public async loadListeners(folderPath: string): Promise<void> {
		const filesToImport = await Util.loadFolder(folderPath)

		for (const file of filesToImport) {
			const event = await import(file)
			if (event.default.listenerInfo.once) {
				try {
					this.once(
						event.default.listenerInfo.name,
						async (...args) => await event.default.run(this, ...args)
					)
				} catch (error) {
					this.logger.error(error)
				}
			} else {
				try {
					this.on(
						event.default.listenerInfo.name,
						async (...args) => await event.default.run(this, ...args)
					)
				} catch (error) {
					this.logger.error(error)
				}
			}
		}
	}

	public async loadTasks(folderPath: string): Promise<void> {
		const filesToImport = await Util.loadFolder(folderPath)

		for (const file of filesToImport) {
			const task = await import(file)
			setInterval(() => {
				try {
					task.default.run(this)
				} catch (error) {
					this.logger.error(error)
				}
			}, task.default.taskInfo.interval)
		}
	}
}

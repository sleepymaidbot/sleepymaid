import 'reflect-metadata'
import {
	ApplicationCommandData,
	AutocompleteInteraction,
	ButtonInteraction,
	Client,
	ClientOptions,
	CommandInteraction,
	ContextMenuCommandInteraction,
	Interaction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	Snowflake
} from 'discord.js'
import Util from '@sleepymaid-ts/util'
import { Logger } from '@sleepymaid-ts/logger'

export interface ClientCommandsType {
	[key: string]: string
}

export type env = 'development' | 'production'

export interface HandlerClientOptions {
	env?: env
	devServerId: string
}

export interface BotClientCommandsType {
	[key: string]: string
}

export interface GuildCommandsType {
	[key: Snowflake]: ApplicationCommandData[]
}

export class HandlerClient extends Client {
	public declare logger: Logger
	public declare commands: ClientCommandsType
	public declare env: env
	public declare devServerId: Snowflake
	constructor(options: HandlerClientOptions, djsOptions: ClientOptions) {
		super(djsOptions)

		const { env, devServerId } = options ?? {}

		this.logger = new Logger()
		this.commands = {}
		this.env = env ?? 'development'
		this.devServerId = devServerId
	}

	public async loadCommands(folderPath: string): Promise<void> {
		this.RegisterApplicationCommands(folderPath)
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

	private async RegisterApplicationCommands(folderPath: string): Promise<void> {
		this.logger.info('Registering application commands...')

		const filesToImport = await Util.loadFolder(folderPath)

		const globalsCommands: ApplicationCommandData[] = []
		const guildCommands: GuildCommandsType = {}

		for (const file of filesToImport) {
			await import(file).then((cmds) => {
				this.commands[cmds.default.commandInfo.data.name] = file
				if (cmds.default.commandInfo.guildIds) {
					if (cmds.default.commandInfo.guildIds.lenght === 1) {
						const guildId = cmds.default.commandInfo.guildIDs[0]
						if (guildCommands[guildId]) {
							guildCommands[guildId].push(cmds.default.commandInfo.data)
						} else {
							guildCommands[guildId] = [cmds.default.commandInfo.data]
						}
					} else {
						for (const id of cmds.default.commandInfo.guildIds) {
							if (guildCommands[id]) {
								guildCommands[id].push(cmds.default.commandInfo.data)
							} else {
								guildCommands[id] = [cmds.default.commandInfo.data]
							}
						}
					}
				} else {
					globalsCommands.push(cmds.default.commandInfo.data)
				}
			})
		}

		// Global commands
		const applicationCommand = globalsCommands
			.map((cmd) => ({
				name: cmd.name,
				// @ts-ignore - This is a workaround for a bug in the builder
				description: cmd.description,
				// @ts-ignore - This is a workaround for a bug in the builder
				options: cmd.options,
				defaultPermission: cmd.defaultPermission,
				type: cmd.type
			}))
			.sort((a, b) => {
				if (a.name < b.name) return -1
				if (a.name > b.name) return 1
				return 0
			}) as ApplicationCommandData[]
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const currentGlobalCommands = (await this.application?.commands.fetch())!
			.map((value1) => ({
				name: value1.name,
				description: value1.description,
				options: value1.options,
				defaultPermission: value1.defaultPermission,
				type: value1.type
			}))
			.sort((a, b) => {
				if (a.name < b.name) return -1
				if (a.name > b.name) return 1
				return 0
			}) as ApplicationCommandData[]

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
					.set(globalsCommands)
					.catch((e) => this.logger.error(e))
				await this.application?.commands.set([])
			} else {
				this.logger.info('Global commands have changed, updating...')
				await this.application?.commands
					.set(globalsCommands)
					.catch((e) => this.logger.error(e))
			}
		} else {
			this.logger.info('Global commands have not changed.')
		}

		// Guild commands
		if (guildCommands) {
			for (const [key, value] of Object.entries(guildCommands)) {
				const guild = this.guilds.cache.get(key)
				if (!guild) continue

				const sortedCommands = value
					.map((cmd) => ({
						name: cmd.name,
						// @ts-ignore - This is a workaround for a bug in the builder
						description: cmd.description,
						// @ts-ignore - This is a workaround for a bug in the builder
						options: cmd.options,
						defaultPermission: cmd.defaultPermission,
						type: cmd.type
					}))
					.sort((a, b) => {
						if (a.name < b.name) return -1
						if (a.name > b.name) return 1
						return 0
					})

				const currentGuildCommands = (await guild.commands.fetch())
					.map((v1) => ({
						name: v1.name,
						description: v1.description,
						options: v1.options,
						defaultPermission: v1.defaultPermission,
						type: v1.type
					}))
					.sort((a, b) => {
						if (a.name < b.name) return -1
						if (a.name > b.name) return 1
						return 0
					})

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
			}
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

	public async loadEvents(folderPath: string): Promise<void> {
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
}

import Util from '@sleepymaid-ts/util'
import {
	ApplicationCommandData,
	AutocompleteInteraction,
	ButtonInteraction,
	Collection,
	CommandInteraction,
	ContextMenuCommandInteraction,
	Interaction,
	ModalSubmitInteraction,
	SelectMenuInteraction,
	Snowflake
} from 'discord.js'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { HandlerClient } from '../HandlerClient'

export interface StartAllOptionsType {
	folder: string
	extraGlobalCommands?: Array<ApplicationCommandData>
	extraGuildCommands?: GuildCommandsType
}

export interface GuildCommandsType {
	[key: Snowflake]: ApplicationCommandData[]
}

export class CommandManager {
	private declare commands: Collection<string, string>
	public declare readonly globalCommands: ApplicationCommandData[]
	public declare readonly guildCommands: Collection<
		string,
		ApplicationCommandData[]
	>
	private declare client: HandlerClient
	constructor(client: HandlerClient) {
		this.client = client
		this.commands = new Collection<string, string>()
		this.globalCommands = []
		this.guildCommands = new Collection<string, ApplicationCommandData[]>()
	}

	public async startAll(options: StartAllOptionsType): Promise<void> {
		await this.loadCommands(
			options.folder,
			options.extraGlobalCommands,
			options.extraGuildCommands
		)
		await this.RegisterApplicationCommands()
		this.client.on('interactionCreate', (i: Interaction) => {
			this.HandleInteractionEvent(i)
		})
	}

	private HandleInteractionEvent(i: Interaction) {
		if (i.isCommand()) {
			this.HandleChatApplicationCommands(i as CommandInteraction)
			this.client.emit('commandRun', i)
		} else if (i.isSelectMenu()) {
			this.client.emit('selectChanged', i as SelectMenuInteraction)
		} else if (i.isButton()) {
			this.client.emit('buttonClicked', i as ButtonInteraction)
		} else if (i.isModalSubmit()) {
			this.client.emit('modalSubmit', i as ModalSubmitInteraction)
		} else if (i.isContextMenuCommand()) {
			// this.HandleContextMenuCommand(i as ContextMenuCommandInteraction)
			this.client.emit('contextMenuRun', i as ContextMenuCommandInteraction)
		} else if (i.isAutocomplete) {
			this.HandleAutocomplete(i as AutocompleteInteraction)
			this.client.emit('autocomplete', i as AutocompleteInteraction)
		}
	}

	public async loadCommands(
		folderPath: string,
		extraGlobalCommands?: Array<ApplicationCommandData>,
		extraGuildCommands?: GuildCommandsType
	): Promise<void> {
		this.client.logger.info('Registering application commands...')
		const topLevelFolders = await readdir(folderPath)
		this.globalCommands.push(...(extraGlobalCommands ?? []))
		for (const [key, value] of Object.entries(extraGuildCommands ?? {})) {
			this.guildCommands.set(key, value)
		}
		for (const folderName of topLevelFolders) {
			switch (folderName) {
				case 'chat': {
					await this.loadChatCommands(join(folderPath, folderName))
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
	}

	private async loadChatCommands(folderPath: string): Promise<void> {
		const filesToImport = await Util.loadFolder(folderPath)

		for (const file of filesToImport) {
			const cmds = await import(file)
			this.commands[cmds.default.commandInfo.data.name] = file
			if (cmds.default.commandInfo.guildIds) {
				for (const id of cmds.default.commandInfo.guildIds) {
					const array = this.guildCommands.get(id) ?? []
					array.push(cmds.default.commandInfo.data)
					this.guildCommands.set(id, array)
				}
			} else {
				this.globalCommands.push(cmds.default.commandInfo.data)
			}
		}
		return
	}

	public async RegisterApplicationCommands() {
		const globalCommands = this.globalCommands
		const guildCommands = this.guildCommands
		// Global commands
		const applicationCommand = globalCommands.sort((a, b) => {
			if (a.name < b.name) return -1
			if (a.name > b.name) return 1
			return 0
		}) as ApplicationCommandData[]
		const currentGlobalCommands =
			(await this.client.application?.commands.fetch()) ??
			([].sort((a, b) => {
				if (a.name < b.name) return -1
				if (a.name > b.name) return 1
				return 0
			}) as ApplicationCommandData[])

		if (
			JSON.stringify(applicationCommand) !==
			JSON.stringify(currentGlobalCommands)
		) {
			if (this.client.env === 'development') {
				const guild = this.client.guilds.cache.get(this.client.devServerId)
				if (!guild) return
				this.client.logger.info(
					'Global commands have changed, updating...(in dev server)'
				)
				await guild.commands
					.set(globalCommands)
					.catch((e) => this.client.logger.error(e))
				await this.client.application?.commands.set([])
			} else {
				this.client.logger.info('Global commands have changed, updating...')
				await this.client.application?.commands
					.set(globalCommands)
					.catch((e) => this.client.logger.error(e))
			}
		} else {
			this.client.logger.info('Global commands have not changed.')
		}

		// Guild commands
		if (guildCommands) {
			guildCommands.forEach(async (value, key) => {
				const guild = this.client.guilds.cache.get(key)
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
					this.client.logger.info(
						`Guild commands for ${guild.name} have changed, updating...`
					)
					await guild.commands
						.set(value)
						.catch((e) => this.client.logger.error(e))
				} else {
					this.client.logger.info(
						`Guild commands for ${guild.name} have not changed.`
					)
				}
			})
		}
	}

	private async HandleChatApplicationCommands(i: CommandInteraction) {
		this.client.logger.info(
			`${i.guild.name} (${i.guild.id}) > ${i.member.user.username} (${i.member.user.id}) > /${i.commandName} (${i.commandId})`
		)
		try {
			const file = this.commands[i.commandName]
			if (!file) return
			const cmd = await import(file)
			await cmd.default.run(i, this.client)
		} catch (error) {
			this.client.logger.error(error)
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
					this.client.logger.error(error)
				}
			}
		}
	}

	private async HandleAutocomplete(i: AutocompleteInteraction) {
		try {
			const file = this.commands[i.commandName]
			if (!file) return
			const cmd = await import(file)
			await cmd.default.autocomplete(i, this.client)
		} catch (error) {
			this.client.logger.error(error)
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
					this.client.logger.error(error)
				}
			}
		}
	}
}

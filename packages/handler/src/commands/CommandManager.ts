import { readdir } from "node:fs/promises"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { findFilesRecursively } from "@sapphire/node-utilities"
import type {
	ApplicationCommandData,
	AutocompleteInteraction,
	CommandInteraction,
	Interaction,
	Snowflake,
} from "discord.js"
import { Collection, InteractionType, MessageFlags } from "discord.js"
import { BaseContainer, Context } from "../BaseContainer"
import { BaseManager } from "../BaseManager"
import type { HandlerClient } from "../HandlerClient"
import { Precondition } from "../preconditions/Precondition"
import { MessageCommand } from "./MessageCommand"
import { SlashCommand } from "./SlashCommand"
import { UserCommand } from "./UserCommand"

export type CommandManagerStartAllOptionsType<Client extends HandlerClient> = {
	folder: string
	preconditions?: (typeof Precondition<Client>)[]
	commandRunContext?: (callback: () => Promise<unknown>, interaction: CommandInteraction) => Promise<void>
}

export type GuildCommandsType = {
	[key: Snowflake]: ApplicationCommandData[]
}

type Commands = {
	data: ApplicationCommandData
	file: string
	guildIds: Snowflake[] | null
	id: Snowflake | null
	name: string
}

type CommandClass = new (
	context: Context<HandlerClient>,
) => MessageCommand<HandlerClient> | SlashCommand<HandlerClient> | UserCommand<HandlerClient>

const commandClassCache = new Map<string, CommandClass>()

async function getCommandClass(file: string): Promise<CommandClass | null> {
	const cached = commandClassCache.get(file)
	if (cached) return cached

	try {
		let importedModule
		try {
			const fileUrl = pathToFileURL(file).toString()
			importedModule = await import(fileUrl)
		} catch (esmError) {
			try {
				// biome-ignore lint/style/noCommonJs: We need to support CommonJS modules
				importedModule = require(file)
			} catch (cjsError) {
				console.error("Failed to import module (both ESM and CommonJS):", file)
				console.error("ESM Error:", esmError)
				console.error("CommonJS Error:", cjsError)
				return null
			}
		}

		const CommandClass = importedModule?.default?.default || importedModule?.default || importedModule

		if (typeof CommandClass !== "function") {
			console.log("No valid command class found in:", file)
			return null
		}

		if (CommandClass.prototype instanceof MessageCommand) {
			commandClassCache.set(file, CommandClass as CommandClass)
			return CommandClass as CommandClass
		}
		if (CommandClass.prototype instanceof SlashCommand) {
			commandClassCache.set(file, CommandClass as CommandClass)
			return CommandClass as CommandClass
		}
		if (CommandClass.prototype instanceof UserCommand) {
			commandClassCache.set(file, CommandClass as CommandClass)
			return CommandClass as CommandClass
		}

		console.log("Command class does not extend any known command type:", file)
		return null
	} catch (error) {
		console.error("Error instantiating command from:", file, error)
		return null
	}
}

function instantiateCommand(
	CommandClass: CommandClass,
	context: Context<HandlerClient>,
): MessageCommand<HandlerClient> | SlashCommand<HandlerClient> | UserCommand<HandlerClient> {
	return new CommandClass(context)
}

export class CommandManager<Client extends HandlerClient> extends BaseManager<Client> {
	private _commands: Collection<string, Commands> = new Collection<string, Commands>()

	private _tempCommands: Collection<string, Commands> = new Collection<string, Commands>()

	private _preconditions: (typeof Precondition<Client>)[] = []

	private _commandRunContext: (callback: () => Promise<unknown>, interaction: CommandInteraction) => Promise<void> =
		async (callback, _interaction) => {
			await callback()
		}

	public async startAll(options: CommandManagerStartAllOptionsType<typeof this.client>): Promise<void> {
		if (!options.folder) throw new Error("No folder path provided!")
		this._preconditions = options.preconditions ?? []
		if (options.commandRunContext) this._commandRunContext = options.commandRunContext

		await this.loadCommand(options.folder)
		this.client.on("interactionCreate", (interaction: Interaction) => {
			if (interaction.type === InteractionType.ApplicationCommand) {
				void this.HandleApplicationCommands(interaction as CommandInteraction)
			} else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
				void this.HandleAutocomplete(interaction)
			}
		})
	}

	private async loadCommand(folderPath: string): Promise<void> {
		this.client.logger.info("Command Handler: -> Registering application commands...")
		const topLevelFolders = await readdir(folderPath)

		for await (const folderName of topLevelFolders) {
			switch (folderName) {
				case "chat": {
					await this.loadCommands(join(folderPath, folderName))
					break
				}

				case "message": {
					await this.loadCommands(join(folderPath, folderName))
					break
				}

				case "user": {
					await this.loadCommands(join(folderPath, folderName))
					break
				}

				default: {
					this.client.logger.info(`Command Handler: -> Unknown folder -> ${folderName}`)
					break
				}
			}
		}

		this.client.logger.info(
			`Command Handler: -> Successfully found ${[...this._tempCommands].length} application commands!`,
		)
		await this.RegisterApplicationCommands()
	}

	private async loadCommands(folderPath: string): Promise<boolean> {
		for await (const file of findFilesRecursively(
			folderPath,
			(filePath: string) => filePath.endsWith(".js") || filePath.endsWith(".ts"),
		)) {
			const container = new BaseContainer<HandlerClient>(this.client)
			const context = new Context<HandlerClient>(container)

			const CommandClass = await getCommandClass(file)
			if (!CommandClass) continue
			const cmd_ = instantiateCommand(CommandClass, context)

			this._tempCommands.set(cmd_.data.name, {
				name: cmd_.data.name,
				file,
				id: null,
				guildIds: cmd_.guildIds ?? null,
				data: cmd_.data,
			})

			this.client.logger.info(`Command Handler: -> Command loaded -> ${cmd_.data.name}`)
		}

		return true
	}

	private async RegisterGlobalApplicationCommands() {
		const globalCommands = Array.from(this._tempCommands.values()).filter((cmd) => cmd.guildIds === null)

		await this.client.application?.commands
			.set(globalCommands.map((cmd) => cmd.data))
			.then((cmds) => {
				for (const cmd of cmds.values()) {
					const current = globalCommands.find((cc) => cc.name === cmd.name)
					if (current) {
						this._commands.set(cmd.id, {
							id: cmd.id,
							name: current.name,
							file: current.file,
							guildIds: null,
							data: current.data,
						})
					}
				}

				this.client.logger.info("Command Handler: -> Successfully registered " + [...cmds].length + " global commands!")
			})
			.catch((error) => this.client.logger.error(error as Error))
	}

	private async RegisterGuildApplicationCommands() {
		const guildCommands = Array.from(this._tempCommands.filter((cmd) => cmd.guildIds !== null).values())
		const guildIdsArray = [...new Set(guildCommands.flatMap((command) => command.guildIds ?? []))]

		await this.client.guilds.fetch()

		for (const guildId of guildIdsArray) {
			const guildCmds = guildCommands.filter((cmd) => cmd.guildIds?.includes(guildId))
			const guild = this.client.guilds.cache.get(guildId)
			if (!guild) {
				this.client.logger.error(`Command Handler: -> Guild ${guildId} not found!`)
				continue
			}

			const cmds = await guild.commands.set(guildCmds.map((cmd) => cmd.data))

			for (const cmd of cmds.values()) {
				const current = guildCmds.find((cc) => cc.name === cmd.name)
				if (current) {
					this._commands.set(cmd.id, {
						id: cmd.id,
						name: current.name,
						file: current.file,
						guildIds: current.guildIds,
						data: current.data,
					})
				}
			}

			this.client.logger.info(
				"Command Handler: -> Successfully registered " +
					[...cmds].length +
					" guild commands for " +
					guild.name +
					" (" +
					guild.id +
					")",
			)
		}
	}

	private async RegisterApplicationCommands() {
		await this.RegisterGlobalApplicationCommands()
		await this.RegisterGuildApplicationCommands()
	}

	private async commandRunContext(callback: () => Promise<unknown>, interaction: CommandInteraction) {
		await this._commandRunContext(callback, interaction)
	}

	private async safeRespond(interaction: CommandInteraction, content: string): Promise<void> {
		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.editReply({ content })
			} else {
				await interaction.reply({ content, flags: MessageFlags.Ephemeral })
			}
		} catch (error) {
			this.client.logger.error(
				new Error(
					`Failed to respond to interaction ${interaction.id}: ${error instanceof Error ? error.message : String(error)}`,
				),
			)
		}
	}

	private async HandleApplicationCommands(interaction: CommandInteraction) {
		if (interaction.guild) {
			this.client.logger.debug(
				`${interaction.guild?.name} (${interaction.guild?.id}) > ${interaction.user.username} (${interaction.user.id}) > /${interaction.commandName} (${interaction.commandId})`,
			)
		} else {
			this.client.logger.debug(
				`${interaction.user.username} (${interaction.user.id}) > /${interaction.commandName} (${interaction.commandId})`,
			)
		}
		try {
			const file = this._commands.get(interaction.commandId)
			if (!file) {
				this.client.logger.error(new Error(`Command file not found for command ID: ${interaction.commandId}`))
				await this.safeRespond(interaction, "Command not found. Please try again later.")
				return
			}

			const container = this.client.container
			const context = new Context<HandlerClient>(container)
			const CommandClass = await getCommandClass(file.file)
			if (!CommandClass) {
				this.client.logger.error(`Failed to load command class from file: ${file.file}`)
				await this.safeRespond(interaction, "There was an error while loading this command!")
				return
			}
			const cmd = instantiateCommand(CommandClass, context)

			if (cmd.preconditions) {
				for (const precondition of [...this._preconditions, ...cmd.preconditions]) {
					const cond = new precondition(context)
					const preconditionResult = await cond.CommandRun!(interaction as never)
					if (preconditionResult === false) {
						await this.safeRespond(interaction, "You do not have permission to use this command.")
						return
					}
					if (preconditionResult instanceof Error) {
						this.client.logger.error(preconditionResult as Error)
						await this.safeRespond(interaction, "There was an error while checking command permissions.")
						return
					}
				}
			}

			if (!cmd.execute) {
				this.client.logger.error(`Command has no execute method: ${file.file}`)
				await this.safeRespond(interaction, "This command is not properly configured.")
				return
			}

			await this.commandRunContext(async () => cmd.execute!(interaction as never), interaction)
		} catch (error) {
			this.client.logger.error(error as Error)
			await this.safeRespond(interaction, "There was an error while executing this command!")
		}
	}

	private async HandleAutocomplete(interaction: AutocompleteInteraction) {
		try {
			const file = this._commands.get(interaction.commandId)
			if (!file) return

			const container = this.client.container
			const context = new Context<HandlerClient>(container)
			const CommandClass = await getCommandClass(file.file)
			if (!CommandClass) return
			const cmd = instantiateCommand(CommandClass, context) as SlashCommand<HandlerClient>

			if (!cmd.autocomplete) return
			await cmd.autocomplete(interaction)
		} catch (error) {
			this.client.logger.error(error as Error)
			try {
				await interaction.respond([])
			} catch {
				try {
					await interaction.respond([])
				} catch (error) {
					this.client.logger.error(error as Error)
				}
			}
		}
	}
}

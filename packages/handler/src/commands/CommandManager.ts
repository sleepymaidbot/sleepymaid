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

async function checkAndInstantiateCommand(
	file: string,
	context: Context<HandlerClient>,
): Promise<MessageCommand<HandlerClient> | SlashCommand<HandlerClient> | UserCommand<HandlerClient> | null> {
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
			return new CommandClass(context) as MessageCommand<HandlerClient>
		} else if (CommandClass.prototype instanceof SlashCommand) {
			return new CommandClass(context) as SlashCommand<HandlerClient>
		} else if (CommandClass.prototype instanceof UserCommand) {
			return new CommandClass(context) as UserCommand<HandlerClient>
		}

		console.log("Command class does not extend any known command type:", file)
		return null
	} catch (error) {
		console.error("Error instantiating command from:", file, error)
		return null
	}
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

			const cmd_ = await checkAndInstantiateCommand(file, context)
			if (!cmd_) continue

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
			if (!file) return

			const container = this.client.container
			const context = new Context<HandlerClient>(container)
			const cmd = await checkAndInstantiateCommand(file.file, context)
			if (!cmd) return

			if (cmd.preconditions) {
				for (const precondition of [...this._preconditions, ...cmd.preconditions]) {
					const cond = new precondition(context)
					const preconditionResult = await cond.CommandRun!(interaction as never)
					if (preconditionResult === false) return
					if (preconditionResult instanceof Error) {
						this.client.logger.error(preconditionResult as Error)
						return
					}
				}
			}

			if (!cmd.execute) return this.client.logger.error("Command has no execute method!")

			await this.commandRunContext(async () => cmd.execute!(interaction as never), interaction)
		} catch (error) {
			this.client.logger.error(error as Error)
			try {
				await interaction.reply({
					content: "There was an error while executing this command!",
					flags: MessageFlags.Ephemeral,
				})
			} catch {
				try {
					await interaction.editReply({
						content: "There was an error while executing this command!",
					})
				} catch (error) {
					this.client.logger.error(error as Error)
				}
			}
		}
	}

	private async HandleAutocomplete(interaction: AutocompleteInteraction) {
		try {
			const file = this._commands.get(interaction.commandId)
			if (!file) return

			const container = this.client.container
			const context = new Context<HandlerClient>(container)
			const cmd = (await checkAndInstantiateCommand(file.file, context)) as SlashCommand<HandlerClient>
			if (!cmd) return

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

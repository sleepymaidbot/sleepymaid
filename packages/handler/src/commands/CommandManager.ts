import 'reflect-metadata';
//import { isEqualObjects } from '@sleepymaid/util';
import {
	ApplicationCommandData,
	AutocompleteInteraction,
	Collection,
	CommandInteraction,
	Interaction,
	InteractionType,
	Snowflake,
} from 'discord.js';
import { join } from 'path';
import { container } from 'tsyringe';
import type { SlashCommandInterface } from './SlashCommand';
import { readdir } from 'fs/promises';
import type { UserCommandInterface } from './UserCommand';
import type { MessageCommandInterface } from './MessageCommand';
import { BaseManager } from '../BaseManager';
import { findFilesRecursively } from '@sapphire/node-utilities';

export interface CommandManagerStartAllOptionsType {
	folder: string;
}

export interface GuildCommandsType {
	[key: Snowflake]: ApplicationCommandData[];
}

interface Commands {
	name: string;
	file: string;
	id: Snowflake | null;
	guildId: Snowflake | null;
	data: ApplicationCommandData;
}

interface CommandInterface {
	guildIds?: string[] | null;
	data: ApplicationCommandData;
}

export class CommandManager extends BaseManager {
	private _commands: Collection<string, Commands> = new Collection<string, Commands>();

	public async startAll(options: CommandManagerStartAllOptionsType): Promise<void> {
		if (!options.folder) throw new Error('No folder path provided!');
		await this.loadCommand(options.folder);
		this.client.on('interactionCreate', (i: Interaction) => {
			if (i.type === InteractionType.ApplicationCommand) {
				this.HandleApplicationCommands(i as CommandInteraction);
			} else if (i.type === InteractionType.ApplicationCommandAutocomplete) {
				this.HandleAutocomplete(i as AutocompleteInteraction);
			}
		});
	}

	private async loadCommand(folderPath: string): Promise<void> {
		this.client.logger.info('Command Handler: -> Registering application commands...');
		const topLevelFolders = await readdir(folderPath);
		for await (const folderName of topLevelFolders) {
			switch (folderName) {
				case 'chat': {
					await this.loadCommands(join(folderPath, folderName));
					break;
				}
				case 'message': {
					await this.loadCommands(join(folderPath, folderName));
					break;
				}
				case 'user': {
					await this.loadCommands(join(folderPath, folderName));
					break;
				}
				default: {
					this.client.logger.info(`Command Handler: -> Unknown folder -> ${folderName}`);
					break;
				}
			}
		}
		this.client.logger.info(
			`Command Handler: -> Successfully found ${[...this._commands].length} application commands!`,
		);
		await this.RegisterApplicationCommands();
	}

	private async loadCommands(folderPath: string): Promise<boolean> {
		for await (const file of findFilesRecursively(folderPath, (filePath: string) => filePath.endsWith('.js'))) {
			const cmd_ = container.resolve<CommandInterface>((await import(file)).default.default);

			if (cmd_.guildIds) {
				for (const id of cmd_.guildIds) {
					this._commands.set('n:' + cmd_.data.name, {
						name: cmd_.data.name,
						file: file,
						id: null,
						guildId: id,
						data: cmd_.data,
					});
				}
			} else {
				this._commands.set('n:' + cmd_.data.name, {
					name: cmd_.data.name,
					file: file,
					id: null,
					guildId: null,
					data: cmd_.data,
				});
			}
			this.client.logger.info(`Command Handler: -> Command loaded -> ${cmd_.data.name}`);
		}
		return true;
	}

	private async RegisterApplicationCommands() {
		// Global commands
		const globalCommands = Array.from(this._commands.values()).filter((cmd) => cmd.guildId === null);

		await this.client.application?.commands
			.set(globalCommands.map((cmd) => cmd.data) as ApplicationCommandData[])
			.then((cmds) => {
				for (const cmd of cmds.values()) {
					const current = globalCommands.find((c) => c.name === cmd.name);
					if (current) {
						this._commands.set(cmd.id, {
							id: cmd.id,
							name: current.name,
							file: current.file,
							guildId: null,
							data: current.data,
						});
					}
				}
				this.client.logger.info(
					'Command Handler: -> Successfully registered ' + [...cmds].length + ' global commands!',
				);
			});

		// Guild commands

		const guildCommands = this._commands.filter((cmd) => cmd.guildId !== null);

		const guildIdsArray = Array.from(guildCommands.values())
			.map((command) => command.guildId)
			.filter((guildId, index, array) => guildId !== null && array.indexOf(guildId) === index);

		for (const guildId of guildIdsArray) {
			const guildCmds = guildCommands.filter((cmd) => cmd.guildId === guildId);
			const guild = this.client.guilds.cache.get(guildId!);
			if (!guild) continue;
			guild.commands.set(guildCmds.map((cmd) => cmd.data)).then((cmds) => {
				for (const cmd of cmds.values()) {
					const current = guildCmds.find((c) => c.name === cmd.name);
					if (current) {
						this._commands.set(cmd.id, {
							id: cmd.id,
							name: current.name,
							file: current.file,
							guildId: current.guildId,
							data: current.data,
						});
					}
				}
				this.client.logger.info(
					'Command Handler: -> Successfully registered ' +
						[...cmds].length +
						' guild commands for ' +
						guild.name +
						' (' +
						guild.id +
						')',
				);
			});
		}

		for (const [key, _value] of this._commands) {
			if (key?.startsWith('n:')) this._commands.delete(key);
		}
	}

	private async HandleApplicationCommands(i: CommandInteraction) {
		this.client.logger.info(
			`${i.guild?.name} (${i.guild?.id}) > ${i.member?.user.username} (${i.member?.user.id}) > /${i.commandName} (${i.commandId})`,
		);
		try {
			const file = this._commands.get(i.commandId);
			if (!file) return;
			const cmd = container.resolve<SlashCommandInterface | UserCommandInterface | MessageCommandInterface>(
				(await import(file.file)).default.default,
			);
			if (!i.inCachedGuild()) return;
			await cmd.execute(i as never, this.client);
		} catch (error) {
			this.client.logger.error(error as Error);
			try {
				await i.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			} catch (error) {
				try {
					await i.editReply({
						content: 'There was an error while executing this command!',
					});
				} catch (error) {
					this.client.logger.error(error as Error);
				}
			}
		}
	}

	private async HandleAutocomplete(i: AutocompleteInteraction) {
		try {
			const file = this._commands.get(i.commandId);
			if (!file) return;
			const cmd = container.resolve<SlashCommandInterface>((await import(file.file)).default.default);
			if (!i.inCachedGuild()) return;
			if (!cmd.autocomplete) return;
			await cmd.autocomplete(i, this.client);
		} catch (error) {
			this.client.logger.error(error as Error);
			try {
				await i.respond([]);
			} catch (error) {
				try {
					await i.respond([]);
				} catch (error) {
					this.client.logger.error(error as Error);
				}
			}
		}
	}
}

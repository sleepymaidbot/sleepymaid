import 'reflect-metadata';
import { isEqualObjects } from '@sleepymaid/util';
import {
	ApplicationCommandData,
	AutocompleteInteraction,
	ButtonInteraction,
	Collection,
	CommandInteraction,
	ContextMenuCommandInteraction,
	Interaction,
	InteractionType,
	ModalSubmitInteraction,
	SelectMenuInteraction,
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
	extraGlobalCommands?: Array<ApplicationCommandData>;
	extraGuildCommands?: GuildCommandsType;
}

export interface GuildCommandsType {
	[key: Snowflake]: ApplicationCommandData[];
}

export class CommandManager extends BaseManager {
	private commands: Collection<string, string> = new Collection<string, string>();
	public readonly globalCommands: ApplicationCommandData[] = [];
	public readonly guildCommands: Collection<string, ApplicationCommandData[]> = new Collection<
		string,
		ApplicationCommandData[]
	>();
	private declare folderPath: string;

	public async startAll(options: CommandManagerStartAllOptionsType): Promise<void> {
		if (!options.folder) throw new Error('No folder path provided!');
		this.folderPath = options.folder;
		await this.loadCommands(options.extraGlobalCommands, options.extraGuildCommands);
		await this.RegisterApplicationCommands();
		this.client.on('interactionCreate', (i: Interaction) => {
			this.HandleInteractionEvent(i);
		});
	}

	private HandleInteractionEvent(i: Interaction) {
		if (i.type === InteractionType.ApplicationCommand) {
			this.HandleApplicationCommands(i as CommandInteraction);
			this.client.emit('commandRun', i);
		} else if (i.isSelectMenu()) {
			this.client.emit('selectChanged', i as SelectMenuInteraction);
		} else if (i.isButton()) {
			this.client.emit('buttonClicked', i as ButtonInteraction);
		} else if (i.type === InteractionType.ModalSubmit) {
			this.client.emit('modalSubmit', i as ModalSubmitInteraction);
		} else if (i.isContextMenuCommand()) {
			this.client.emit('contextMenuRun', i as ContextMenuCommandInteraction);
		} else if (i.type === InteractionType.ApplicationCommandAutocomplete) {
			this.HandleAutocomplete(i as AutocompleteInteraction);
			this.client.emit('autocomplete', i as AutocompleteInteraction);
		}
	}

	private async loadCommands(
		extraGlobalCommands?: Array<ApplicationCommandData>,
		extraGuildCommands?: GuildCommandsType,
	): Promise<void> {
		this.client.logger.info('Command Handler: -> Registering application commands...');
		const topLevelFolders = await readdir(this.folderPath);
		this.globalCommands.push(...(extraGlobalCommands ?? []));
		for (const [key, value] of Object.entries(extraGuildCommands ?? {})) {
			this.guildCommands.set(key, value);
		}
		let count = 0;
		for await (const folderName of topLevelFolders) {
			switch (folderName) {
				case 'chat': {
					count = count + (await this.loadChatCommands(join(this.folderPath, folderName)));
					break;
				}
				case 'message': {
					count = count + (await this.loadMessageCommands(join(this.folderPath, folderName)));
					break;
				}
				case 'user': {
					count = count + (await this.loadUserCommands(join(this.folderPath, folderName)));
					break;
				}
			}
		}
		this.client.logger.info(`Command Handler: -> Registered ${count} application commands!`);
	}

	private async loadChatCommands(folderPath: string): Promise<number> {
		let count = 0;
		for await (const file of findFilesRecursively(folderPath, (filePath: string) => filePath.endsWith('.js'))) {
			const cmd_ = container.resolve<SlashCommandInterface>((await import(file)).default);

			this.commands.set(cmd_.data.name, file);
			if (cmd_.guildIds) {
				for (const id of cmd_.guildIds) {
					const array = this.guildCommands.get(id) ?? [];
					array.push(cmd_.data);
					this.guildCommands.set(id, array);
				}
			} else {
				this.globalCommands.push(cmd_.data);
			}
			this.client.logger.info(`Command Handler: -> Command loaded -> ${cmd_.data.name}`);
			count++;
		}
		return count;
	}

	private async loadMessageCommands(folderPath: string): Promise<number> {
		let count = 0;
		for await (const file of findFilesRecursively(folderPath, (filePath: string) => filePath.endsWith('.js'))) {
			const cmd_ = container.resolve<MessageCommandInterface>((await import(file)).default);

			this.commands.set(cmd_.data.name, file);
			if (cmd_.guildIds) {
				for (const id of cmd_.guildIds) {
					const array = this.guildCommands.get(id) ?? [];
					array.push(cmd_.data);
					this.guildCommands.set(id, array);
				}
			} else {
				this.globalCommands.push(cmd_.data);
			}
			this.client.logger.info(`Command Handler: -> Command loaded -> ${cmd_.data.name}`);
			count++;
		}
		return count;
	}

	private async loadUserCommands(folderPath: string): Promise<number> {
		let count = 0;
		for await (const file of findFilesRecursively(folderPath, (filePath: string) => filePath.endsWith('.js'))) {
			const cmd_ = container.resolve<UserCommandInterface>((await import(file)).default);

			this.commands.set(cmd_.data.name, file);
			if (cmd_.guildIds) {
				for (const id of cmd_.guildIds) {
					const array = this.guildCommands.get(id) ?? [];
					array.push(cmd_.data);
					this.guildCommands.set(id, array);
				}
			} else {
				this.globalCommands.push(cmd_.data);
			}
			this.client.logger.info(`Command Handler: -> Command loaded -> ${cmd_.data.name}`);
			count++;
		}
		return count;
	}

	private async RegisterApplicationCommands() {
		const globalCommands = this.globalCommands;
		const guildCommands = this.guildCommands;
		// Global commands
		if (this.client.env === 'dev') {
			const array = guildCommands.get(this.client.devServerId) ?? [];
			array.push(...globalCommands);
			guildCommands.set(this.client.devServerId, array);
		} else {
			const applicationCommand = globalCommands.sort((a, b) => {
				if (a.name < b.name) return -1;
				if (a.name > b.name) return 1;
				return 0;
			}) as ApplicationCommandData[];
			const currentGlobalCommands =
				(await this.client.application?.commands.fetch()) ??
				([].sort((a: ApplicationCommandData, b: ApplicationCommandData) => {
					if (a.name < b.name) return -1;
					if (a.name > b.name) return 1;
					return 0;
				}) as ApplicationCommandData[]);

			if (!isEqualObjects(applicationCommand, currentGlobalCommands)) {
				this.client.logger.info('Command Handler: -> Global commands have changed, updating...');
				await this.client.application?.commands.set(globalCommands).catch((e) => this.client.logger.error(e));
			} else {
				this.client.logger.info('Command Handler: -> Global commands have not changed.');
			}
		}

		// Guild commands
		if (guildCommands) {
			guildCommands.forEach(async (value, key) => {
				const guild = this.client.guilds.cache.get(key);
				if (!guild) return;

				const sortedCommands = value.sort((a, b) => {
					if (a.name < b.name) return -1;
					if (a.name > b.name) return 1;
					return 0;
				});

				const currentGuildCommands = (await guild.commands.fetch()).sort((a, b) => {
					if (a.name < b.name) return -1;
					if (a.name > b.name) return 1;
					return 0;
				});

				if (!isEqualObjects(sortedCommands, currentGuildCommands)) {
					this.client.logger.info(`Command Handler: -> Guild commands for ${guild.name} have changed, updating...`);
					await guild.commands.set(value).catch((e) => this.client.logger.error(e));
				} else {
					this.client.logger.info(`Command Handler: -> Guild commands for ${guild.name} have not changed.`);
				}
			});
		}
	}

	private async HandleApplicationCommands(i: CommandInteraction) {
		this.client.logger.info(
			`${i.guild?.name} (${i.guild?.id}) > ${i.member?.user.username} (${i.member?.user.id}) > /${i.commandName} (${i.commandId})`,
		);
		try {
			const file = this.commands.get(i.commandName);
			if (!file) return;
			const cmd = container.resolve<SlashCommandInterface | UserCommandInterface | MessageCommandInterface>(
				(await import(file)).default,
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
			const file = this.commands.get(i.commandName);
			if (!file) return;
			const cmd = container.resolve<SlashCommandInterface>((await import(file)).default);
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

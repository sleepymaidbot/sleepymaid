import 'reflect-metadata';
import { container } from 'tsyringe';
import type { ListenerInterface } from './Listener';
import { BaseManager } from '../BaseManager';
import { findFilesRecursively } from '@sapphire/node-utilities';

export interface ListenerManagerStartAllOptionsType {
	folder: string;
}

export class ListenerManager extends BaseManager {
	public async startAll(options: ListenerManagerStartAllOptionsType): Promise<void> {
		await this.loadListeners(options.folder);
	}

	private async loadListeners(folderPath: string): Promise<void> {
		let count = 0;
		for await (const file of findFilesRecursively(folderPath, (filePath: string) => filePath.endsWith('.js'))) {
			const event = container.resolve<ListenerInterface>((await import(file)).default.default);
			if (event.once) {
				try {
					this.client.once(event.name, async (...args) => {
						await event.execute(...args, this.client);
					});
					count++;
				} catch (error) {
					this.client.logger.error(error as Error);
				}
			} else {
				try {
					this.client.on(event.name, async (...args) => {
						await event.execute(...args, this.client);
					});
					count++;
				} catch (error) {
					this.client.logger.error(error as Error);
				}
			}
			this.client.logger.info(`Listener handler: -> Loaded listener -> ${file?.split('/')?.pop()?.split('.')[0]}`);
		}
		this.client.logger.info(`
			Listener handler: -> Loaded ${count} listeners`);
	}
}

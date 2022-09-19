import 'reflect-metadata';
import { loadFolder } from '@sleepymaid/util';
import { container } from 'tsyringe';
import type { TaskInterface } from './Task';
import { BaseManager } from '../BaseManager';
import { schedule } from 'node-cron';

export interface TaskManagerStartAllOptionsType {
	folder: string;
}

export class TaskManager extends BaseManager {
	public async startAll(options: TaskManagerStartAllOptionsType): Promise<void> {
		await this.loadTasks(options.folder);
	}

	public async loadTasks(folderPath: string): Promise<void> {
		const filesToImport = await loadFolder(folderPath);

		let count = 0;
		for (const file of filesToImport) {
			const task = container.resolve<TaskInterface>((await import(file)).default);
			try {
				schedule(task.interval, () => task.execute(this.client));
			} catch (error) {
				this.client.logger.error(error as Error);
			}
			count++;
			this.client.logger.info(`Task handler: -> Loaded task -> ${file?.split('/')?.pop()?.split('.')[0]}`);
		}
		this.client.logger.info(`
			Task handler: -> Loaded ${count} tasks`);
	}
}

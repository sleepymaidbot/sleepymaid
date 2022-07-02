import 'reflect-metadata'
import { loadFolder } from '@sleepymaid/util'
import { container } from 'tsyringe'
import { HandlerClient } from '../HandlerClient'
import { TaskInterface } from './TaskInterface'

export interface TaskManagerStartAllOptionsType {
	folder: string
}

export class TaskManager {
	private client: HandlerClient
	constructor(client: HandlerClient) {
		this.client = client
	}

	public async startAll(
		options: TaskManagerStartAllOptionsType
	): Promise<void> {
		await this.loadTasks(options.folder)
	}

	public async loadTasks(folderPath: string): Promise<void> {
		const filesToImport = await loadFolder(folderPath)

		for (const file of filesToImport) {
			const task = container.resolve<TaskInterface>(
				(await import(file)).default
			)
			setInterval(() => {
				try {
					task.execute(this.client)
				} catch (error) {
					this.client.logger.error(error)
				}
			}, task.interval)
			this.client.logger.info(
				`Task handler: -> Loaded task -> ${file.split('/').pop().split('.')[0]}`
			)
		}
	}
}

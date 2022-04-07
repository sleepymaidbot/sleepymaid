import Util from '@sleepymaid-ts/util'
import { HandlerClient } from '../HandlerClient'

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
		const filesToImport = await Util.loadFolder(folderPath)

		for (const file of filesToImport) {
			const task = await import(file)
			setInterval(() => {
				try {
					task.default.run(this)
				} catch (error) {
					this.client.logger.error(error)
				}
			}, task.default.taskInfo.interval)
		}
	}
}

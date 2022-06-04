import { loadFolder } from '@sleepymaid/util'
import { HandlerClient } from '../HandlerClient'

export interface ListenerManagerStartAllOptionsType {
	folder: string
}

export class ListenerManager {
	private client: HandlerClient
	constructor(client: HandlerClient) {
		this.client = client
	}

	public async startAll(
		options: ListenerManagerStartAllOptionsType
	): Promise<void> {
		await this.loadListeners(options.folder)
	}

	private async loadListeners(folderPath: string): Promise<void> {
		const filesToImport = await loadFolder(folderPath)

		for (const file of filesToImport) {
			const event = await import(file)
			if (event.default.listenerInfo.once) {
				try {
					this.client.once(
						event.default.listenerInfo.name,
						async (...args) => await event.default.run(...args, this.client)
					)
				} catch (error) {
					this.client.logger.error(error)
				}
			} else {
				try {
					this.client.on(
						event.default.listenerInfo.name,
						async (...args) => await event.default.run(...args, this.client)
					)
				} catch (error) {
					this.client.logger.error(error)
				}
			}
		}
	}
}

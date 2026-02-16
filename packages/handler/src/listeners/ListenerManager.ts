import { sep } from "node:path"
import { pathToFileURL } from "node:url"
import { findFilesRecursively } from "@sapphire/node-utilities"
import type { ClientEvents } from "discord.js"
import { Context } from "../BaseContainer"
import { BaseManager } from "../BaseManager"
import type { HandlerClient } from "../HandlerClient"
import { Listener } from "./Listener"

export type ListenerManagerStartAllOptionsType = {
	folder: string
}

type ListenerClass = new (context: Context<HandlerClient>) => Listener<keyof ClientEvents, HandlerClient>

const listenerClassCache = new Map<string, ListenerClass>()

async function getListenerClass(file: string): Promise<ListenerClass | null> {
	const cached = listenerClassCache.get(file)
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

		const ListenerClass = importedModule?.default?.default || importedModule?.default || importedModule

		if (typeof ListenerClass === "function" && ListenerClass.prototype instanceof Listener) {
			listenerClassCache.set(file, ListenerClass as ListenerClass)
			return ListenerClass as ListenerClass
		}

		console.log("No valid listener class found in:", file)
		return null
	} catch (error) {
		console.error("Error instantiating listener from:", file, error)
		return null
	}
}

function instantiateListener(
	ListenerClass: ListenerClass,
	context: Context<HandlerClient>,
): Listener<keyof ClientEvents, HandlerClient> {
	return new ListenerClass(context)
}

export class ListenerManager<Client extends HandlerClient> extends BaseManager<Client> {
	public async startAll(options: ListenerManagerStartAllOptionsType): Promise<void> {
		await this.loadListeners(options.folder)
	}

	private async loadListeners(folderPath: string): Promise<void> {
		let count = 0
		for await (const file of findFilesRecursively(
			folderPath,
			(filePath: string) => filePath.endsWith(".js") || filePath.endsWith(".ts"),
		)) {
			try {
				const container = this.client.container
				const context = new Context<HandlerClient>(container)

				const ListenerClass = await getListenerClass(file)
				if (!ListenerClass) continue
				const listener = instantiateListener(ListenerClass, context)

				if (listener.once) {
					this.client.once(listener.name, async (...args: ClientEvents[typeof listener.name]) => {
						await listener.execute!(...args)
					})
				} else {
					this.client.on(listener.name, async (...args: ClientEvents[typeof listener.name]) => {
						await listener.execute!(...args)
					})
				}

				count++
				this.client.logger.info(`Listener handler: -> Loaded listener -> ${file.split(sep).pop()?.split(".")[0]}`)
			} catch (error) {
				this.client.logger.error(error as Error)
			}
		}

		this.client.logger.info(`Listener handler: -> Loaded ${count} listeners`)
	}
}

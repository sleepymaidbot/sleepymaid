import { pathToFileURL } from "node:url";
import { findFilesRecursively } from "@sapphire/node-utilities";
import type { ClientEvents } from "discord.js";
import { Context, BaseContainer } from "../BaseContainer";
import { BaseManager } from "../BaseManager";
import type { HandlerClient } from "../HandlerClient";
import { Listener } from "./Listener";

export type ListenerManagerStartAllOptionsType = {
	folder: string;
};

async function checkAndInstantiateListener(
	file: string,
	context: Context<HandlerClient>,
): Promise<Listener<keyof ClientEvents, HandlerClient> | null> {
	try {
		const importedModule = await import(file);
		if (importedModule.default) {
			const nestedDefault = importedModule.default.default;
			if (typeof nestedDefault === "function") {
				if (nestedDefault.prototype instanceof Listener) {
					return new nestedDefault(context);
				} else {
					return null;
				}
			} else {
				return null;
			}
		} else {
			return null;
		}
	} catch {
		try {
			const newFile = pathToFileURL(file).toString();
			const importedModule = await import(newFile);
			if (importedModule.default) {
				const nestedDefault = importedModule.default.default;
				if (typeof nestedDefault === "function") {
					if (nestedDefault.prototype instanceof Listener) {
						return new nestedDefault(context);
					} else {
						return null;
					}
				} else {
					return null;
				}
			} else {
				return null;
			}
		} catch (error) {
			console.error(error);
			return null;
		}
	}
}

export class ListenerManager extends BaseManager {
	public async startAll(options: ListenerManagerStartAllOptionsType): Promise<void> {
		await this.loadListeners(options.folder);
	}

	private async loadListeners(folderPath: string): Promise<void> {
		let count = 0;
		for await (const file of findFilesRecursively(folderPath, (filePath: string) => filePath.endsWith(".js"))) {
			try {
				const container = new BaseContainer<HandlerClient>(this.client);
				const context = new Context<HandlerClient>(container);

				const listener = await checkAndInstantiateListener(file, context);

				if (!listener) continue;

				if (listener.once) {
					this.client.once(listener.name, async (...args: ClientEvents[typeof listener.name]) => {
						await listener.execute!(...args);
					});
				} else {
					this.client.on(listener.name, async (...args: ClientEvents[typeof listener.name]) => {
						await listener.execute!(...args);
					});
				}

				count++;
				this.client.logger.info(`Listener handler: -> Loaded listener -> ${file.split("/").pop()?.split(".")[0]}`);
			} catch (error) {
				this.client.logger.error(error as Error);
			}
		}

		this.client.logger.info(`Listener handler: -> Loaded ${count} listeners`);
	}
}

import { pathToFileURL } from "node:url";
import { findFilesRecursively } from "@sapphire/node-utilities";
import { schedule } from "node-cron";
import { Context } from "../BaseContainer";
import { BaseManager } from "../BaseManager";
import type { HandlerClient } from "../HandlerClient";
import { Task } from "./Task";
import { sep } from "node:path";

export type TaskManagerStartAllOptionsType = {
	folder: string;
};

async function checkAndInstantiateTask(
	file: string,
	context: Context<HandlerClient>,
): Promise<Task<HandlerClient> | null> {
	try {
		let importedModule;

		try {
			const fileUrl = pathToFileURL(file).toString();
			importedModule = await import(fileUrl);
		} catch (esmError) {
			try {
				importedModule = require(file);
			} catch (cjsError) {
				console.error("Failed to import module (both ESM and CommonJS):", file);
				console.error("ESM Error:", esmError);
				console.error("CommonJS Error:", cjsError);
				return null;
			}
		}

		const TaskClass = importedModule?.default?.default || importedModule?.default || importedModule;

		if (typeof TaskClass === "function" && TaskClass.prototype instanceof Task) {
			return new TaskClass(context);
		}

		console.log("No valid task class found in:", file);
		return null;
	} catch (error) {
		console.error("Error instantiating task from:", file, error);
		return null;
	}
}

export class TaskManager extends BaseManager {
	public async startAll(options: TaskManagerStartAllOptionsType): Promise<void> {
		await this.loadTasks(options.folder);
	}

	public async loadTasks(folderPath: string): Promise<void> {
		let count = 0;
		for await (const file of findFilesRecursively(folderPath, (filePath: string) => filePath.endsWith(".js"))) {
			const container = this.client.container;
			const context = new Context<HandlerClient>(container);

			const task = await checkAndInstantiateTask(file, context);

			if (!task) continue;

			try {
				schedule(task.interval, () => task.execute!());
			} catch (error) {
				this.client.logger.error(error as Error);
			}

			if (task.runOnStart) task.execute!();

			count++;
			this.client.logger.info(`Task handler: -> Loaded task -> ${file.split(sep).pop()?.split(".")[0]}`);
		}

		this.client.logger.info(`Task handler: -> Loaded ${count} tasks`);
	}
}

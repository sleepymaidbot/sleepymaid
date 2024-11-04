import { pathToFileURL } from "node:url";
import { findFilesRecursively } from "@sapphire/node-utilities";
import { schedule } from "node-cron";
import { BaseContainer, Context } from "../BaseContainer";
import { BaseManager } from "../BaseManager";
import type { HandlerClient } from "../HandlerClient";
import { Task } from "./Task";

export type TaskManagerStartAllOptionsType = {
	folder: string;
};

async function checkAndInstantiateTask(
	file: string,
	context: Context<HandlerClient>,
): Promise<Task<HandlerClient> | null> {
	try {
		const { default: importedModule } = await import(file).catch(async () => import(pathToFileURL(file).toString()));
		const nestedDefault = importedModule?.default;

		if (typeof nestedDefault === "function" && nestedDefault.prototype instanceof Task) {
			return new nestedDefault(context);
		}

		return null;
	} catch (error) {
		console.error(error);
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
			const container = new BaseContainer<HandlerClient>(this.client);
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
			this.client.logger.info(`Task handler: -> Loaded task -> ${file?.split("/")?.pop()?.split(".")[0]}`);
		}

		this.client.logger.info(`Task handler: -> Loaded ${count} tasks`);
	}
}

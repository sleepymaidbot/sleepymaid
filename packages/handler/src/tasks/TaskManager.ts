import { sep } from "node:path"
import { pathToFileURL } from "node:url"
import { findFilesRecursively } from "@sapphire/node-utilities"
import { schedule } from "node-cron"
import { Context } from "../BaseContainer"
import { BaseManager } from "../BaseManager"
import type { HandlerClient } from "../HandlerClient"
import { Task } from "./Task"

export type TaskManagerStartAllOptionsType = {
	folder: string
}

type TaskClass = new (context: Context<HandlerClient>) => Task<HandlerClient>

const taskClassCache = new Map<string, TaskClass>()

async function getTaskClass(file: string): Promise<TaskClass | null> {
	const cached = taskClassCache.get(file)
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

		const TaskClass = importedModule?.default?.default || importedModule?.default || importedModule

		if (typeof TaskClass === "function" && TaskClass.prototype instanceof Task) {
			taskClassCache.set(file, TaskClass as TaskClass)
			return TaskClass as TaskClass
		}

		console.log("No valid task class found in:", file)
		return null
	} catch (error) {
		console.error("Error instantiating task from:", file, error)
		return null
	}
}

function instantiateTask(TaskClass: TaskClass, context: Context<HandlerClient>): Task<HandlerClient> {
	return new TaskClass(context)
}

export class TaskManager<Client extends HandlerClient> extends BaseManager<Client> {
	public async startAll(options: TaskManagerStartAllOptionsType): Promise<void> {
		await this.loadTasks(options.folder)
	}

	public async loadTasks(folderPath: string): Promise<void> {
		let count = 0
		for await (const file of findFilesRecursively(
			folderPath,
			(filePath: string) => filePath.endsWith(".js") || filePath.endsWith(".ts"),
		)) {
			const container = this.client.container
			const context = new Context<HandlerClient>(container)

			const TaskClass = await getTaskClass(file)
			if (!TaskClass) continue
			const task = instantiateTask(TaskClass, context)

			try {
				schedule(task.interval, () => task.execute!())
			} catch (error) {
				this.client.logger.error(error as Error)
			}

			if (task.runOnStart) task.execute!()

			count++
			this.client.logger.info(`Task handler: -> Loaded task -> ${file.split(sep).pop()?.split(".")[0]}`)
		}

		this.client.logger.info(`Task handler: -> Loaded ${count} tasks`)
	}
}

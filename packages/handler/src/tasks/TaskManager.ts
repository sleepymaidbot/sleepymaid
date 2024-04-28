import "reflect-metadata";
import { findFilesRecursively } from "@sapphire/node-utilities";
import { container } from "tsyringe";
import type { TaskInterface } from "./Task";
import { BaseManager } from "../BaseManager";
import { schedule } from "node-cron";

export interface TaskManagerStartAllOptionsType {
  folder: string;
}

export class TaskManager extends BaseManager {
  public async startAll(
    options: TaskManagerStartAllOptionsType,
  ): Promise<void> {
    await this.loadTasks(options.folder);
  }

  public async loadTasks(folderPath: string): Promise<void> {
    let count = 0;
    for await (const file of findFilesRecursively(
      folderPath,
      (filePath: string) => filePath.endsWith(".js"),
    )) {
      const task = container.resolve<TaskInterface>(
        (await import(file)).default.default,
      );
      try {
        schedule(task.interval, () => task.execute(this.client));
      } catch (error) {
        this.client.logger.error(error as Error);
      }
      count++;
      this.client.logger.info(
        `Task handler: -> Loaded task -> ${file?.split("/")?.pop()?.split(".")[0]}`,
      );
    }
    this.client.logger.info(`
			Task handler: -> Loaded ${count} tasks`);
  }
}

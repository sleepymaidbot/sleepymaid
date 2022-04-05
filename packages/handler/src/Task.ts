import { HandlerClient } from './HandlerClient'

export type TaskInfo = {
	interval: number
}

export type FunctionType = {
	run: TaskRunFunction
}

export type TaskRunFunction = (client: HandlerClient) => void

export class Task {
	taskInfo: TaskInfo
	constructor(TaskInfo: TaskInfo, functions: FunctionType) {
		this.taskInfo = TaskInfo
		this.run = functions.run
	}

	run(_client: HandlerClient) {
		console.log('Task ran')
	}
}

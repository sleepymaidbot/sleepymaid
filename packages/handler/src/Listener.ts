import { HandlerClient } from './HandlerClient'

export type ListenerInfo = {
	name: string
	once: boolean
}

export type FunctionType = {
	run: CommandRunFunction
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CommandRunFunction = (client: HandlerClient, ...args: any[]) => void

export class Listener {
	listenerInfo: ListenerInfo
	constructor(listenerInfo: ListenerInfo, functions: FunctionType) {
		this.listenerInfo = listenerInfo
		this.run = functions.run
	}

	run(_client: HandlerClient, ...args: any[]) {
		console.log('Listener ran')
	}
}

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HandlerClient } from '../HandlerClient'

export type ListenerInfo = {
	name: string
	once: boolean
}

export type FunctionType = {
	run: ListenerRunFunction
}

export type ListenerRunFunction = (
	client: HandlerClient,
	...args: any[]
) => void

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

import { HandlerClient } from '../HandlerClient'

export interface TaskInterface {
	interval: number
	execute: (client: HandlerClient) => unknown | Promise<unknown>
}

export interface ListenerInterface {
	name: string
	once: boolean
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	execute: (...args: any[]) => unknown | Promise<unknown>
}

import { env } from './HandlerClient'

export class Logger {
	public declare env: env
	constructor(env: env) {
		this.env = env
	}

	debug(message: string, ...args: string[]): void {
		if (this.env === 'production') return
		console.debug(message, ...args)
	}

	info(message: string, ...args: string[]): void {
		console.info(message, ...args)
	}

	error(error: string, ...args: string[]): void {
		console.error(error, ...args)
	}
}

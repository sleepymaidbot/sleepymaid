import type { env } from "./HandlerClient"

export class BaseLogger {
	public declare env: env
	constructor(env: env) {
		this.env = env
	}

	debug(message: string, ...args: string[]): void {
		if (this.env === "prod") return
		console.debug(message, ...args)
	}

	info(message: string, ...args: string[]): void {
		console.info(message, ...args)
	}

	error(error: string | Error, ...args: string[]): void {
		console.error(error, ...args)
	}
}

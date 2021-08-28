import { gray, blue, red } from 'ansi-colors'

export class Logger {
	constructor(protected name: string) {
		// do nothing...
	}

	forkInstance(name: string): Logger {
		return new Logger(name)
	}

	private formatMessage(message: string, ...args: string[]): string {
		return `${this.name}: ${message} ${args.join(' ')}`
	}

	debug(message: string, ...args: string[]): void {
		console.debug(this.formatMessage(gray(message), ...args))
	}

	info(message: string, ...args: string[]): void {
		console.log(this.formatMessage(blue(message), ...args))
	}

	error(error: Error, ...args: string[]): void {
		console.error(
			this.formatMessage(red(error.stack ?? error.message), ...args)
		)
	}
}

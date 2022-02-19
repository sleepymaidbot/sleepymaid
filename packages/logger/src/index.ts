import { gray, blue, red, cyan } from 'ansi-colors'
import pino from 'pino'

export enum Loglevels {
	Debug,
	Info,
	Error
}

export const prefixes = new Map<Loglevels, string>([
	[Loglevels.Debug, 'DEBUG'],
	[Loglevels.Info, 'INFO'],
	[Loglevels.Error, 'ERROR']
])

export const noColor: (str: string) => string = (msg) => msg
export const colorFunctions = new Map<Loglevels, (str: string) => string>([
	[Loglevels.Debug, gray],
	[Loglevels.Info, cyan],
	[Loglevels.Error, (str: string) => red(str)]
])

export class Logger {
	public declare pino
	constructor(protected name: string) {
		this.pino = pino({
			transport: {
				target: 'pino-pretty'
			}
		})
	}

	forkInstance(name: string): Logger {
		return new Logger(name)
	}

	private formatMessage(
		level: Loglevels,
		message: string,
		...args: string[]
	): string {
		let color = colorFunctions.get(level)
		if (!color) color = noColor

		const date = new Date()
		const log = [
			`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`,
			`: ${message} ${args.join(' ')}`
		]
		return log.join(' ')
	}

	debug(message: string, ...args: string[]): void {
		this.pino.debug(this.formatMessage(Loglevels.Debug, gray(message), ...args))
	}

	info(message: string, ...args: string[]): void {
		this.pino.info(this.formatMessage(Loglevels.Info, blue(message), ...args))
	}

	error(error: Error, ...args: string[]): void {
		this.pino.error(
			this.formatMessage(
				Loglevels.Error,
				red(error.stack ?? error.message),
				...args
			)
		)
	}
}

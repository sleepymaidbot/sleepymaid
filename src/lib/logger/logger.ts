import { gray, blue, red, cyan } from 'ansi-colors'

export enum Loglevels {
	Debug,
	Info,
	Error
}

const prefixes = new Map<Loglevels, string>([
	[Loglevels.Debug, 'DEBUG'],
	[Loglevels.Info, 'INFO'],
	[Loglevels.Error, 'ERROR']
])

const noColor: (str: string) => string = (msg) => msg
const colorFunctions = new Map<Loglevels, (str: string) => string>([
	[Loglevels.Debug, gray],
	[Loglevels.Info, cyan],
	[Loglevels.Error, (str: string) => red(str)]
])

export class Logger {
	constructor(protected name: string) {
		// do nothing...
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
			`${this.name}`,
			`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`,
			color(prefixes.get(level) || 'DEBUG'),
			`: ${message} ${args.join(' ')}`
		]
		return log.join(' ')
	}

	debug(message: string, ...args: string[]): void {
		console.debug(this.formatMessage(Loglevels.Debug, gray(message), ...args))
	}

	info(message: string, ...args: string[]): void {
		console.log(this.formatMessage(Loglevels.Info, blue(message), ...args))
	}

	error(error: Error, ...args: string[]): void {
		console.error(
			this.formatMessage(
				Loglevels.Error,
				red(error.stack ?? error.message),
				...args
			)
		)
	}
}

import { BaseLogger, type env } from "@sleepymaid/handler";
import { gray, red, cyan } from "ansi-colors";

export enum Loglevels {
	Debug,
	Info,
	Error,
}

export const prefixes = {
	[Loglevels.Debug]: "DEBUG",
	[Loglevels.Info]: "INFO",
	[Loglevels.Error]: "ERROR",
};

export const noColor: (str: string) => string = (msg) => msg;
export const colorFunctions = {
	[Loglevels.Debug]: gray,
	[Loglevels.Info]: cyan,
	[Loglevels.Error]: (str: string) => red(str),
};

export class Logger extends BaseLogger {
	constructor(env: env) {
		super(env);
	}

	private formatMessage(level: Loglevels, message: string, ...args: string[]): string {
		let color = colorFunctions[level] ?? noColor;

		const date = new Date();
		const log = [
			`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`,
			` ${color(prefixes[level] ?? "")}`,
			`: ${message} ${args.join(" ")}`,
		];
		return log.join(" ");
	}

	public override debug(message: string, ...args: string[]): void {
		// this.pino.debug(this.formatMessage(Loglevels.Debug, gray(message), ...args))
		console.debug(this.formatMessage(Loglevels.Debug, gray(message), ...args));
	}

	public override info(message: string, ...args: string[]): void {
		// this.pino.info(this.formatMessage(Loglevels.Info, blue(message), ...args))
		console.info(this.formatMessage(Loglevels.Info, cyan(message), ...args));
	}

	public override error(error: Error | string, ...args: string[]): void {
		/* this.pino.error(
			this.formatMessage(
				Loglevels.Error,
				red(error.stack ?? error.message),
				...args
			)
		)*/
		if (error instanceof Error) {
			try {
				console.error(this.formatMessage(Loglevels.Error, red(error.stack ?? error.message), ...args));
			} catch {
				console.error(error);
			}
		} else {
			try {
				console.error(this.formatMessage(Loglevels.Error, red(error), ...args));
			} catch {
				console.error(error);
			}
		}
	}
}

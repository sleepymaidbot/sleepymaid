import { gray, blue, red, cyan } from "ansi-colors";
import { BaseLogger } from "@sleepymaid/handler";

export enum Loglevels {
	Debug,
	Info,
	Error,
}

export const prefixes = new Map<Loglevels, string>([
	[Loglevels.Debug, "DEBUG"],
	[Loglevels.Info, "INFO"],
	[Loglevels.Error, "ERROR"],
]);

export const noColor: (str: string) => string = (msg) => msg;
export const colorFunctions = new Map<Loglevels, (str: string) => string>([
	[Loglevels.Debug, gray],
	[Loglevels.Info, cyan],
	[Loglevels.Error, (str: string) => red(str)],
]);

export class Logger extends BaseLogger {
	//public declare pino: BaseLogger

	private formatMessage(level: Loglevels, message: string, ...args: string[]): string {
		let color = colorFunctions.get(level);
		if (!color) color = noColor;

		const date = new Date();
		const log = [`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`, `: ${message} ${args.join(" ")}`];
		return log.join(" ");
	}

	override debug(message: string, ...args: string[]): void {
		//this.pino.debug(this.formatMessage(Loglevels.Debug, gray(message), ...args))
		console.debug(this.formatMessage(Loglevels.Debug, gray(message), ...args));
	}

	override info(message: string, ...args: string[]): void {
		//this.pino.info(this.formatMessage(Loglevels.Info, blue(message), ...args))
		console.info(this.formatMessage(Loglevels.Info, blue(message), ...args));
	}

	override error(error: string | Error, ...args: string[]): void {
		/*this.pino.error(
			this.formatMessage(
				Loglevels.Error,
				red(error.stack ?? error.message),
				...args
			)
		)*/
		if (error instanceof Error) {
			console.error(this.formatMessage(Loglevels.Error, red(error.stack ?? error.message), ...args));
		} else {
			console.error(this.formatMessage(Loglevels.Error, red(error), ...args));
		}
	}
}

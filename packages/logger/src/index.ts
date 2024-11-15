import { BaseLogger, type env } from "@sleepymaid/handler";
import { gray, red, cyan } from "ansi-colors";
import { APIEmbed, ColorResolvable, resolveColor, WebhookClient } from "discord.js";

const removeAnsiCodes = (str: string): string => {
	return str.replace(/\x1b\[[0-9;]*m/g, "");
};

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

export type WebhookOptions = {
	webhookURL?: string;
	name?: string;
	color?: ColorResolvable;
	iconURL?: string;
};

export class Logger extends BaseLogger {
	private webhook?: WebhookClient;

	private webhookQueue: APIEmbed[] = [];

	private webhookTime: number = 0;

	private webhookOptions: WebhookOptions = {};

	constructor(env: env, webhookURL?: string) {
		super(env);
		if (webhookURL) this.setWebhook({ webhookURL });
	}

	public setWebhook(options: WebhookOptions): void {
		this.webhookOptions = options;
		if (!this.webhookOptions.webhookURL) return;
		this.webhook = new WebhookClient(
			{ url: this.webhookOptions.webhookURL },
			{
				allowedMentions: {
					users: [],
					roles: [],
				},
			},
		);
		this.webhookTime = Date.now();
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

	private formatEmbedMessage(level: Loglevels, message: string, ...args: string[]): string {
		const date = new Date();
		const log = [
			`[${date.toLocaleDateString()} ${date.toLocaleTimeString()}]`,
			` ${prefixes[level] ?? ""}`,
			`: ${message} ${args.join(" ")}`,
		];
		return `\`\`\`${removeAnsiCodes(log.join(" "))}\`\`\``;
	}

	private addEmbed(embed: APIEmbed): void {
		if (!this.webhook) return;
		this.webhookQueue.push(embed);
		if (this.webhookQueue.length >= 10 || Date.now() - this.webhookTime >= 10000) this.sendWebhookQueue();
	}

	private sendWebhookQueue(): void {
		if (!this.webhook) return;
		this.webhook.send({
			username: this.webhookOptions.name,
			avatarURL: this.webhookOptions.iconURL,
			embeds: this.webhookQueue,
		});
		this.webhookQueue = [];
		this.webhookTime = Date.now();
	}

	private formatEmbed(level: Loglevels, message: string, ...args: string[]): APIEmbed {
		let color: ColorResolvable;
		if (level === Loglevels.Error) {
			color = resolveColor("#ff0000");
		} else {
			color = resolveColor(this.webhookOptions.color ?? "#d4bdf9");
		}

		return {
			author: {
				name: this.webhookOptions.name ?? "Bot" + " - " + prefixes[level],
				icon_url: this.webhookOptions.iconURL,
			},
			color,
			description: this.formatEmbedMessage(level, message, ...args),
		};
	}

	public override debug(message: string, ...args: string[]): void {
		// this.pino.debug(this.formatMessage(Loglevels.Debug, gray(message), ...args))
		console.debug(this.formatMessage(Loglevels.Debug, gray(message), ...args));
	}

	public override info(message: string, ...args: string[]): void {
		// this.pino.info(this.formatMessage(Loglevels.Info, blue(message), ...args))
		console.info(this.formatMessage(Loglevels.Info, cyan(message), ...args));

		this.addEmbed(this.formatEmbed(Loglevels.Info, cyan(message), ...args));
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

				this.addEmbed(this.formatEmbed(Loglevels.Error, red(error.stack ?? error.message), ...args));
			} catch {
				console.error(error);
			}
		} else {
			try {
				console.error(this.formatMessage(Loglevels.Error, red(error), ...args));

				this.addEmbed(this.formatEmbed(Loglevels.Error, red(error), ...args));
			} catch {
				console.error(error);
			}
		}
	}
}

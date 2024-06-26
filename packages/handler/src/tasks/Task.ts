import type { Awaitable } from "discord.js";
import type { BaseContainer, Context } from "../BaseContainer";
import type { HandlerClient } from "../HandlerClient";

export class Task<Client extends HandlerClient> {
	public interval: string;

	public container: BaseContainer<Client>;

	public constructor(context: Context<Client>, options: TaskOptions) {
		this.container = context.container;
		this.interval = options.interval;
	}

	public execute?(): Awaitable<unknown>;
}

export type TaskOptions = {
	interval: string;
};

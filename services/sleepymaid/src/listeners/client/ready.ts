/* eslint-disable id-length */
import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class ReadyListener extends Listener<"ready", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "ready",
			once: true,
		});
	}

	public override async execute() {
		const client = this.container.client;
		client.logger.info(
			`Logged in as ${this.container.client.user!.tag} | ${this.container.client.guilds.cache.size} servers`,
		);
	}
}

import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { Client } from "discord.js";
import type { TestClient } from "../../lib/extensions/TestClient";

export default class ReadyListener extends Listener<"ready", TestClient> {
	public constructor(context: Context<TestClient>) {
		super(context, {
			name: "ready",
			once: true,
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override execute(_client: Client<true>) {
		const client = this.container.client;
		client.logger.info(`Logged in as ${client.user!.tag} | ${client.guilds.cache.size} servers`);
	}
}

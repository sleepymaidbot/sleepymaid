import { Listener, type Context } from "@sleepymaid/handler";
import type { WatcherClient } from "../../lib/extensions/WatcherClient";

export default class ReadyListener extends Listener<"ready", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "ready",
			once: true,
		});
	}

	public override async execute() {
		const client = this.container.client;
		client.logger.info(`Logged in as ${client.user!.tag} | ${client.guilds.cache.size} servers`);
		const guilds = await client.guilds.fetch();
		for (const guild of guilds.values()) {
			const g = await client.guilds.fetch(guild.id);

			await g.members.fetch().catch((e) => client.logger.error(e));
		}
	}
}

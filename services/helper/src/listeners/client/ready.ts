import type { ListenerInterface } from "@sleepymaid/handler";
import type { HelperClient } from "../../lib/extensions/HelperClient";

export default class ReadyListener implements ListenerInterface {
	public readonly name = "ready";
	public readonly once = true;

	public async execute(client: HelperClient) {
		client.logger.info(`Logged in as ${client.user!.tag} | ${client.guilds.cache.size} servers`);
		const guilds = await client.guilds.fetch();
		for (const guild of guilds.values()) {
			const g = await client.guilds.fetch(guild.id);

			await g.members.fetch().catch((e) => client.logger.error(e));
		}
	}
}

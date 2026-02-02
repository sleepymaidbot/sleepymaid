import { type Context, Listener } from "@sleepymaid/handler"
import type { WatcherClient } from "../../lib/extensions/WatcherClient"

export default class ReadyListener extends Listener<"clientReady", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "clientReady",
			once: true,
		})
	}

	public override async execute() {
		const client = this.container.client
		client.logger.info(`Logged in as ${client.user!.tag} | ${client.guilds.cache.size} servers`)

		client.logger.setWebhook({
			webhookURL: client.config.discordWebhookUrl,
			name: client.user?.username,
			iconURL: client.user?.displayAvatarURL(),
			color: "#607d8b",
		})
	}
}

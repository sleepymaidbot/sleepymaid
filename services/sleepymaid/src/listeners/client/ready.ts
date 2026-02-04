import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class ReadyListener extends Listener<"clientReady", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "clientReady",
			once: true,
		})
	}

	public override async execute() {
		const client = this.container.client
		client.logger.info(
			`Logged in as ${this.container.client.user!.tag} | ${this.container.client.guilds.cache.size} servers`,
		)

		client.logger.setWebhook({
			webhookURL: client.config.discordWebhookUrl,
			name: client.user?.username,
			iconURL: client.user?.displayAvatarURL(),
			color: "#d4bdf9",
		})
	}
}

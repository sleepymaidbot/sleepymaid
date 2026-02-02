import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { HelperClient } from "../../lib/extensions/HelperClient"

export default class ReadyListener extends Listener<"ready", HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			name: "ready",
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
			color: "#5664f0",
		})
	}
}

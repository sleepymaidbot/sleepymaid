import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { Client } from "discord.js"
import type { ClarityClient } from "../../lib/ClarityClient"

export default class ReadyListener extends Listener<"clientReady", ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			name: "clientReady",
			once: true,
		})
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	public override execute(_client: Client<true>) {
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

import { Result } from "@sapphire/result"
import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import { ratioGuildIds } from "@sleepymaid/shared"
import type { Message } from "discord.js"
import { sitesDelEmbed } from "../../lib/downloader"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

const enabled = true

export default class VidListener extends Listener<"messageCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		})
	}

	public override async execute(message: Message) {
		if (!enabled) return
		if (message.author.bot) return
		if (!message.guildId || !ratioGuildIds.includes(message.guildId)) return
		const client = this.container.client

		const args = message.content.split(" ")

		for (let arg of args) {
			const file = await this.container.manager.downloadVideo(arg)
			if (file === null) continue

			const messageReturn = await Result.fromAsync(async () =>
				message.reply({
					files: [
						{
							attachment: await file.getFilePath(),
							name: await file.getFileName(),
						},
					],
				}),
			)
			if (messageReturn.isOk()) {
				if (sitesDelEmbed.some((a) => arg.includes(a))) message.suppressEmbeds(true).catch(console.error)
				await file.delete()
			} else if (messageReturn.isErr()) {
				client.logger.error(messageReturn.unwrapErr() as Error)
				return
			}
		}
	}
}

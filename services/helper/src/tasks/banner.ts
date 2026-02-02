import { opendir } from "node:fs/promises"
import { join } from "node:path"
import type { Context } from "@sleepymaid/handler"
import { Task } from "@sleepymaid/handler"
import type { Channel, ForumChannel } from "discord.js"
import { ChannelType } from "discord.js"
import type { HelperClient } from "../lib/extensions/HelperClient"

function isForumChannel(channel: Channel): channel is ForumChannel {
	return channel.type === ChannelType.GuildForum
}

export default class BannerTask extends Task<HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			interval: "0 * * * *",
		})
	}

	public override async execute() {
		const client = this.container.client
		if (client.config.nodeEnv === "dev") return
		const guild = client.guilds.cache.get("324284116021542922")
		if (!guild?.premiumSubscriptionCount) return
		if (guild.premiumSubscriptionCount < 7) return
		client.logger.debug("Banner task started")
		try {
			// eslint-disable-next-line unicorn/prefer-module
			const dir = await opendir(join(__dirname, "../../banners"))
			const banners = []
			for await (const dirent of dir) {
				if (dirent.name.endsWith(".png")) banners.push(dirent.name)
			}

			const banner = banners[Math.floor(Math.random() * banners.length)]
			// eslint-disable-next-line unicorn/prefer-module
			await guild?.setBanner(join(__dirname, `../../banners/${banner}`), `Changed banner to ${banner}`)

			const channel = guild?.channels.cache.get("1024444544407834675")
			if (!channel || !isForumChannel(channel)) return
			const thread = await channel.threads.fetch("1026359286093336606")
			if (!thread) return
			await thread.send(`**Banner Rotation**\nBanner is now \`\`${banner}\`\``)
		} catch (error) {
			client.logger.error(error as Error)
		}
	}
}

import { Context, Listener } from "@sleepymaid/handler"
import { APIEmbed, AuditLogEvent, Colors, GuildEmoji } from "discord.js"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends Listener<"emojiDelete", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "emojiDelete",
			once: false,
		})
	}

	public override async execute(emoji: GuildEmoji) {
		const channels = (await this.container.manager.getLogChannel(emoji.guild.id))?.filter((c) => c.channelEvents.create)
		if (!channels || channels.length === 0) return

		const embed: APIEmbed = {
			title: "Emoji Deleted",
			color: Colors.Red,
			fields: [
				{
					name: "Emoji",
					value: `${emoji}`,
					inline: true,
				},
				{
					name: "Emoji ID",
					value: `${emoji.id}`,
					inline: true,
				},
				{
					name: "Emoji Name",
					value: `${emoji.name}`,
					inline: true,
				},
				{
					name: "Emoji URL",
					value: `${emoji.imageURL()}`,
					inline: true,
				},
				{
					name: "Emoji Animated",
					value: `${emoji.animated ? "Yes" : "No"}`,
					inline: true,
				},
			],
			timestamp: new Date().toISOString(),
		}

		const author = await emoji.guild.fetchAuditLogs({
			type: AuditLogEvent.EmojiDelete,
		})
		const log = author.entries
			.filter((l) => l.target && "id" in l.target && l.target.id === emoji.id)
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first()

		if (log && log.executor && log.executorId !== emoji.guild.id && log.createdTimestamp > Date.now() - 1000 * 60 * 2) {
			embed.footer = {
				text: `${log.executor.displayName} (${log.executorId})`,
				icon_url: log.executor.displayAvatarURL(),
			}
		}

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, { embeds: [embed] })
		}
	}
}

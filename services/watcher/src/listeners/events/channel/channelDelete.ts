import { Context, Listener } from "@sleepymaid/handler"
import { channelNames } from "@sleepymaid/shared"
import { APIEmbed, APIEmbedField, AuditLogEvent, Colors, DMChannel, GuildChannel, TextChannel } from "discord.js"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends Listener<"channelDelete", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "channelDelete",
			once: false,
		})
	}

	public override async execute(channel: GuildChannel | DMChannel) {
		if (channel instanceof DMChannel) return
		if (!channel.guild) return
		const channels = (await this.container.manager.getLogChannel(channel.guild?.id))?.filter(
			(c) => c.channelEvents.delete,
		)
		if (!channels || channels.length === 0) return

		const fields: APIEmbedField[] = []

		fields.push({
			name: "Channel",
			value: `${channel.name} (${channel.id})`,
			inline: true,
		})

		fields.push({
			name: "Type",
			value: channelNames[channel.type] || "Unknown Channel Type",
			inline: true,
		})

		if (channel.parent) {
			fields.push({
				name: "Category",
				value: channel.parent.name,
				inline: true,
			})
		}

		if (channel instanceof TextChannel && channel.topic) {
			fields.push({
				name: "Topic",
				value: channel.topic,
				inline: true,
			})
		}

		const embed: APIEmbed = {
			title: "Channel Deleted",
			color: Colors.Red,
			fields,
			timestamp: new Date().toISOString(),
		}

		const author = await channel.guild.fetchAuditLogs({
			type: AuditLogEvent.ChannelDelete,
		})
		const log = author.entries
			.filter((l) => l.target.id === channel.id)
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first()

		if (
			log &&
			log.executor &&
			log.executorId !== channel.guild.id &&
			log.createdTimestamp > Date.now() - 1000 * 60 * 2
		) {
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

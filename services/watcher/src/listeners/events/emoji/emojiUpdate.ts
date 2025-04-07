import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../../lib/extensions/WatcherClient";
import { Colors, APIEmbed, AuditLogEvent, APIEmbedField } from "discord.js";
import { GuildEmoji } from "discord.js";

export default class extends Listener<"emojiUpdate", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "emojiUpdate",
			once: false,
		});
	}

	public override async execute(oldEmoji: GuildEmoji, newEmoji: GuildEmoji) {
		const channels = (await this.container.manager.getLogChannel(oldEmoji.guild.id))?.filter(
			(c) => c.channelEvents.create,
		);
		if (!channels || channels.length === 0) return;

		const fields: APIEmbedField[] = [];

		if (oldEmoji.name !== newEmoji.name) {
			fields.push({
				name: "Emoji Name",
				value: `${oldEmoji.name} -> ${newEmoji.name}`,
				inline: true,
			});
		}

		if (oldEmoji.animated !== newEmoji.animated) {
			fields.push({
				name: "Emoji Animated",
				value: `${oldEmoji.animated ? "Yes" : "No"} -> ${newEmoji.animated ? "Yes" : "No"}`,
				inline: true,
			});
		}

		if (oldEmoji.imageURL() !== newEmoji.imageURL()) {
			fields.push({
				name: "Emoji URL",
				value: `${oldEmoji.imageURL()} -> ${newEmoji.imageURL()}`,
				inline: true,
			});
		}

		const embed: APIEmbed = {
			title: "Emoji Updated",
			color: Colors.Blurple,
			fields,
			timestamp: new Date().toISOString(),
		};

		const author = await oldEmoji.guild.fetchAuditLogs({
			type: AuditLogEvent.EmojiUpdate,
		});
		const log = author.entries
			.filter((l) => l.target && "id" in l.target && l.target.id === oldEmoji.id)
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first();

		if (
			log &&
			log.executor &&
			log.executorId !== oldEmoji.guild.id &&
			log.createdTimestamp > Date.now() - 1000 * 60 * 2
		) {
			embed.footer = {
				text: `${log.executor.displayName} (${log.executorId})`,
				icon_url: log.executor.displayAvatarURL(),
			};
		}

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, { embeds: [embed] });
		}
	}
}

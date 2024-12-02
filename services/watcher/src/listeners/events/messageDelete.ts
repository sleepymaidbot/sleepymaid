import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { APIEmbed, APIEmbedField, AuditLogEvent, Colors, Message } from "discord.js";

export default class extends Listener<"messageDelete", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "messageDelete",
			once: false,
		});
	}

	public override async execute(message: Message<true>) {
		if (!message.guild) return;
		const channels = (await this.container.manager.getLogChannel(message.guild.id))?.filter(
			(c) => c.messageEvents.delete,
		);
		if (!channels || channels.length === 0) return;

		const content = message.content === "" ? "No content" : `\`\`\`${message.content}\`\`\``;

		const fields: APIEmbedField[] = [
			{
				name: "Author",
				value: `${message.author.displayName} (${message.author.id})`,
				inline: true,
			},
			{
				name: "Channel",
				value: `${message.channel}`,
				inline: true,
			},
			{
				name: "Content",
				value: content,
				inline: false,
			},
		];

		if (message.attachments.size > 0) {
			fields.push({
				name: "Attachments",
				value: message.attachments.map((a) => a.url).join("\n"),
				inline: false,
			});
		}

		if (message.stickers.size > 0) {
			fields.push({
				name: "Stickers",
				value: message.stickers.map((s) => s.name).join("\n"),
				inline: false,
			});
		}

		const embed: APIEmbed = {
			title: "Message Deleted",
			color: Colors.Red,
			fields,
			timestamp: new Date().toISOString(),
		};

		const author = await message.guild.fetchAuditLogs({
			type: AuditLogEvent.MessageDelete,
			limit: 1,
		});
		const log = author.entries.first();

		if (log && log.executor && log.executorId !== message.author.id && log.target.id === message.author.id) {
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

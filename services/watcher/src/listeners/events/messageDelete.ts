import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { APIEmbedField, Colors, Message } from "discord.js";

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

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, [
				{
					title: "Message Deleted",
					color: Colors.Red,
					fields,
					timestamp: new Date().toISOString(),
				},
			]);
		}
	}
}

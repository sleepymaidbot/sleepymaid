import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { Message, WebhookClient } from "discord.js";

export default class extends Listener<"messageDelete", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "messageDelete",
			once: false,
		});
	}

	public override async execute(message: Message<true>) {
		if (!message.guild) return;
		const channels = await this.container.manager.getLogChannel(message.guild.id);
		if (!channels) return;

		for (const channel of channels) {
			if (!channel.messageEvents.delete) continue;

			const webhook = new WebhookClient({
				id: channel.webhookId,
				token: channel.webhookToken,
			});

			const content = message.content ? `\`\`\`${message.content}\`\`\`` : "No content";

			webhook.send({
				username: `${this.container.client.user?.displayName}`,
				avatarURL: this.container.client.user?.displayAvatarURL(),
				threadId: channel.threadId ?? undefined,
				embeds: [
					{
						title: "Message Deleted",
						fields: [
							{
								name: "Author",
								value: `${message.author.displayName} (${message.author.id})`,
								inline: true,
							},
							{
								name: "Channel",
								value: `<#${message.channel.id}>`,
								inline: true,
							},
							{
								name: "Content",
								value: content,
								inline: false,
							},
						],
					},
				],
			});
		}
	}
}

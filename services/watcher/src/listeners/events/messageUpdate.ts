import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { Message, WebhookClient } from "discord.js";

export default class extends Listener<"messageUpdate", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "messageUpdate",
			once: false,
		});
	}

	public override async execute(oldMessage: Message<true>, newMessage: Message<true>) {
		if (!oldMessage.guild) return;

		if (oldMessage.content !== newMessage.content) {
			const channels = await this.container.manager.getLogChannel(oldMessage.guild.id);
			if (!channels) return;

			for (const channel of channels) {
				if (!channel.messageEvents.edit) continue;

				const webhook = new WebhookClient({
					id: channel.webhookId,
					token: channel.webhookToken,
				});

				webhook
					.send({
						username: `${this.container.client.user?.displayName}`,
						avatarURL: this.container.client.user?.displayAvatarURL(),
						threadId: channel.threadId ?? undefined,
						embeds: [
							{
								title: "Message Edited",
								fields: [
									{
										name: "Author",
										value: `<@${oldMessage.author.id}>`,
										inline: true,
									},
									{
										name: "Channel",
										value: `<#${oldMessage.channel.id}>`,
										inline: true,
									},
									{
										name: "Old Content",
										value: `\`\`\`${oldMessage.content}\`\`\``,
										inline: false,
									},
									{
										name: "New Content",
										value: `\`\`\`${newMessage.content}\`\`\``,
										inline: false,
									},
								],
							},
						],
					})
					.catch(() => {
						this.container.logger.error(`Failed to send message edit log to ${channel.id} (${channel.channelId})`);
					});
			}
		}
	}
}

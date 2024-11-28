import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { Colors, Message } from "discord.js";

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

				await this.container.manager.sendLog(channel, [
					{
						title: "Message Edited",
						color: Colors.Blurple,
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
				]);
			}
		}
	}
}

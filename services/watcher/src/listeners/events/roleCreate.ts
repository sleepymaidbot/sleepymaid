import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { Role, WebhookClient } from "discord.js";

export default class extends Listener<"roleCreate", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "roleCreate",
			once: false,
		});
	}

	public override async execute(role: Role) {
		const channels = await this.container.manager.getLogChannel(role.guild.id);

		if (!channels) return;

		for (const channel of channels) {
			if (!channel.roleEvents.create) continue;

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
							title: "Role Created",
							fields: [
								{
									name: "Role",
									value: `${role.name} (${role.id})`,
								},
								{
									name: "Color",
									value: `${role.hexColor}`,
								},
								{
									name: "Permissions",
									value: `${role.permissions.toArray().join(", ")}`,
								},
								{
									name: "Mentionable",
									value: `${role.mentionable ? "Yes" : "No"}`,
								},
								{
									name: "Hoisted",
									value: `${role.hoist ? "Yes" : "No"}`,
								},
								{
									name: "Position",
									value: `${role.position}`,
								},
							],
						},
					],
				})
				.catch(() => {
					this.container.logger.error(`Failed to send role create log to ${channel.id} (${channel.channelId})`);
				});
		}
	}
}

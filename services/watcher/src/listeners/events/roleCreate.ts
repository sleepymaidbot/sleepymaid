import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { Colors, Role } from "discord.js";

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

			await this.container.manager.sendLog(channel, [
				{
					title: "Role Created",
					color: Colors.Aqua,
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
			]);
		}
	}
}

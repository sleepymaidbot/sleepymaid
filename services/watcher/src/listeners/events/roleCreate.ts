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
		const channels = (await this.container.manager.getLogChannel(role.guild.id))?.filter((c) => c.roleEvents.create);
		if (!channels || channels.length === 0) return;

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, [
				{
					title: "Role Created",
					color: Colors.Aqua,
					fields: [
						{
							name: "Role",
							value: `${role.name} (${role.id})`,
							inline: true,
						},
						{
							name: "Color",
							value: `${role.hexColor}`,
							inline: true,
						},
						{
							name: "Permissions",
							value: `${role.permissions.toArray().join(", ")}`,
							inline: true,
						},
						{
							name: "Mentionable",
							value: `${role.mentionable ? "Yes" : "No"}`,
							inline: true,
						},
						{
							name: "Hoisted",
							value: `${role.hoist ? "Yes" : "No"}`,
							inline: true,
						},
						{
							name: "Position",
							value: `${role.position}`,
							inline: true,
						},
					],
					timestamp: new Date().toISOString(),
				},
			]);
		}
	}
}

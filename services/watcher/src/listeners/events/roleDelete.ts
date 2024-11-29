import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { intToHexColor } from "@sleepymaid/util";
import { Role } from "discord.js";

export default class extends Listener<"roleDelete", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "roleDelete",
			once: false,
		});
	}

	public override async execute(role: Role) {
		const channels = (await this.container.manager.getLogChannel(role.guild.id))?.filter((c) => c.roleEvents.delete);
		if (!channels || channels.length === 0) return;

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, [
				{
					title: "Role Deleted",
					color: role.color,
					fields: [
						{
							name: "Role",
							value: `${role.name} (${role.id})`,
							inline: true,
						},
						{
							name: "Color",
							value: `${intToHexColor(role.color)}`,
							inline: true,
						},
						{
							name: "Hoisted",
							value: `${role.hoist}`,
							inline: true,
						},
						{
							name: "Mentionable",
							value: `${role.mentionable}`,
							inline: true,
						},
						{
							name: "Position",
							value: `${role.position}`,
							inline: true,
						},
						{
							name: "Permissions",
							value: `${role.permissions.toArray().join(", ")}`,
							inline: true,
						},
					],
				},
			]);
		}
	}
}

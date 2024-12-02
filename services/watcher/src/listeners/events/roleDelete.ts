import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { intToHexColor } from "@sleepymaid/util";
import { APIEmbed, AuditLogEvent, Role } from "discord.js";

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

		const embed: APIEmbed = {
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
			timestamp: new Date().toISOString(),
		};

		const author = await role.guild.fetchAuditLogs({
			type: AuditLogEvent.RoleDelete,
			limit: 1,
		});
		const log = author.entries.first();

		if (log && log.executor && log.target && log.executorId !== role.id && log.target.id === role.id) {
			embed.footer = {
				text: `${log.executor.displayName} (${log.executorId})`,
				icon_url: log.executor.displayAvatarURL(),
			};
		}

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, [embed]);
		}
	}
}

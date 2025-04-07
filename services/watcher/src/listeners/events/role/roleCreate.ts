import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../../lib/extensions/WatcherClient";
import { APIEmbed, AuditLogEvent, Colors, Role } from "discord.js";

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

		const embed: APIEmbed = {
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
		};

		const author = await role.guild.fetchAuditLogs({
			type: AuditLogEvent.RoleCreate,
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
			await this.container.manager.sendLog(channel, { embeds: [embed] });
		}
	}
}

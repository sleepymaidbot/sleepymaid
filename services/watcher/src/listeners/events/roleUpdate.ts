import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { APIEmbed, APIEmbedField, AttachmentBuilder, AuditLogEvent, Role } from "discord.js";
import { intToHexColor } from "@sleepymaid/util";
import { generateSplitImage } from "@sleepymaid/shared";

export default class extends Listener<"roleUpdate", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "roleUpdate",
			once: false,
		});
	}

	public override async execute(oldRole: Role, newRole: Role) {
		const channels = (await this.container.manager.getLogChannel(newRole.guild.id))?.filter((c) => c.roleEvents.update);
		if (!channels || channels.length === 0) return;

		const embed: APIEmbed = {
			title: "Role Updated",
			color: newRole.color,
			timestamp: new Date().toISOString(),
		};

		let attachment: AttachmentBuilder | null = null;

		const fields: APIEmbedField[] = [
			{
				name: "Role",
				value: `${newRole.name} (${newRole.id})`,
				inline: false,
			},
		];

		if (oldRole.name !== newRole.name) {
			fields.push({
				name: "Name",
				value: `${oldRole.name} -> ${newRole.name}`,
				inline: true,
			});
		}

		if (oldRole.color !== newRole.color) {
			fields.push({
				name: "Color",
				value: `${intToHexColor(oldRole.color)} -> ${intToHexColor(newRole.color)}`,
				inline: true,
			});
			const buffer = await generateSplitImage(oldRole.color, newRole.color);

			const attachmentName = `${oldRole.id}-${newRole.id}.png`;
			attachment = new AttachmentBuilder(buffer, { name: attachmentName });

			embed.thumbnail = {
				url: `attachment://${attachmentName}`,
			};
		}

		if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
			const addedPermissions = newRole.permissions.toArray().filter((p) => !oldRole.permissions.toArray().includes(p));
			const removedPermissions = oldRole.permissions
				.toArray()
				.filter((p) => !newRole.permissions.toArray().includes(p));

			if (addedPermissions.length > 0) {
				fields.push({
					name: "Added Permissions",
					value: addedPermissions.map((p) => `<:add:807723944236285972> ${p}`).join("\n"),
					inline: true,
				});
			}

			if (removedPermissions.length > 0) {
				fields.push({
					name: "Removed Permissions",
					value: removedPermissions.map((p) => `<:remove:807723917925941268> ${p}`).join("\n"),
					inline: true,
				});
			}
		}

		if (oldRole.hoist !== newRole.hoist) {
			fields.push({
				name: "Hoist",
				value: `${oldRole.hoist} -> ${newRole.hoist}`,
				inline: true,
			});
		}

		if (oldRole.mentionable !== newRole.mentionable) {
			fields.push({
				name: "Mentionable",
				value: `${oldRole.mentionable} -> ${newRole.mentionable}`,
				inline: true,
			});
		}

		if (oldRole.position !== newRole.position) {
			fields.push({
				name: "Position",
				value: `${oldRole.position} -> ${newRole.position}`,
				inline: true,
			});
		}

		if (fields.length === 1) return;
		embed.fields = fields;

		const author = await newRole.guild.fetchAuditLogs({
			type: AuditLogEvent.RoleUpdate,
			limit: 1,
		});
		const log = author.entries.first();

		if (log && log.executor && log.target && log.executorId !== newRole.id && log.target.id === newRole.id) {
			embed.footer = {
				text: `${log.executor.displayName} (${log.executorId})`,
				icon_url: log.executor.displayAvatarURL(),
			};
		} else if (fields.some((f) => f.name === "Position")) {
			return;
		}

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, { embeds: [embed], files: attachment ? [attachment] : undefined });
		}
	}
}

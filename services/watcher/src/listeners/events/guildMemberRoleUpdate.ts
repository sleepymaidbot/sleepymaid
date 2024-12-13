import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../lib/extensions/WatcherClient";
import { GuildMember, APIEmbed, Colors, APIEmbedField, AuditLogEvent } from "discord.js";

export default class extends Listener<"guildMemberUpdate", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "guildMemberUpdate",
			once: false,
		});
	}

	public override async execute(oldMember: GuildMember, newMember: GuildMember) {
		if (oldMember.roles.cache.size === newMember.roles.cache.size) return;
		const channels = (await this.container.manager.getLogChannel(oldMember.guild.id))?.filter(
			(c) => c.memberEvents.roleChange,
		);
		if (!channels || channels.length === 0) return;

		const embed: APIEmbed = {
			title: "Member Role Updated",
			color: newMember.roles.highest.color || Colors.Blurple,
			thumbnail: {
				url: newMember.user.displayAvatarURL(),
			},
			timestamp: new Date().toISOString(),
		};

		const fields: APIEmbedField[] = [
			{
				name: "User",
				value: `${newMember.displayName} (${newMember.id})`,
				inline: false,
			},
		];

		const addedRoles = newMember.roles.cache.filter((r) => !oldMember.roles.cache.has(r.id));
		const removedRoles = oldMember.roles.cache.filter((r) => !newMember.roles.cache.has(r.id));

		if (addedRoles.size > 0) {
			fields.push({
				name: "Added Roles",
				value: addedRoles.map((r) => `<:add:807723944236285972> ${r}`).join("\n"),
				inline: true,
			});
		}

		if (removedRoles.size > 0) {
			fields.push({
				name: "Removed Roles",
				value: removedRoles.map((r) => `<:remove:807723917925941268> ${r}`).join("\n"),
				inline: true,
			});
		}

		embed.fields = fields;

		const author = await newMember.guild.fetchAuditLogs({
			type: AuditLogEvent.MemberRoleUpdate,
		});
		const log = author.entries
			.filter((l) => l.target?.id === newMember.id)
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first();

		if (log && log.executor) {
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

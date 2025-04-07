import { Context, Listener } from "@sleepymaid/handler";
import { WatcherClient } from "../../../lib/extensions/WatcherClient";
import { APIEmbed, APIEmbedField, AuditLogEvent, ChannelType, Colors, GuildChannel, OverwriteType } from "discord.js";

const channelTypes: Partial<Record<ChannelType, string>> = {
	[ChannelType.GuildText]: "Text Channel",
	[ChannelType.GuildVoice]: "Voice Channel",
	[ChannelType.GuildCategory]: "Category",
	[ChannelType.GuildStageVoice]: "Stage Channel",
	[ChannelType.GuildForum]: "Forum Channel",
	[ChannelType.GuildAnnouncement]: "Announcement Channel",
	[ChannelType.GuildDirectory]: "Directory Channel",
	[ChannelType.GuildMedia]: "Media Channel",
};

export default class extends Listener<"channelCreate", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "channelCreate",
			once: false,
		});
	}

	public override async execute(channel: GuildChannel) {
		if (!channel.guild) return;
		const channels = (await this.container.manager.getLogChannel(channel.guild.id))?.filter(
			(c) => c.channelEvents.create,
		);
		if (!channels || channels.length === 0) return;

		const fields: APIEmbedField[] = [];

		fields.push({
			name: "Channel",
			value: `${channel.name} (${channel.id})`,
			inline: true,
		});

		fields.push({
			name: "Type",
			value: channelTypes[channel.type] || "Unknown Channel Type",
			inline: true,
		});

		if (channel.parent) {
			fields.push({
				name: "Category",
				value: channel.parent.name,
				inline: true,
			});
		}

		if (channel.permissionOverwrites.cache.size > 0) {
			const overrides = channel.permissionOverwrites.cache.map((o) => {
				const allowedPermissions = o.allow.toArray().map((p) => {
					return `<:add:807723944236285972> ${p}`;
				});
				const deniedPermissions = o.deny.toArray().map((p) => {
					return `<:remove:807723917925941268> ${p}`;
				});
				const output = `\n${allowedPermissions.join("\n")}\n${deniedPermissions.join("\n")}`;
				switch (o.type) {
					case OverwriteType.Role:
						return `**Role:** <@&${o.id}>\n${output}`;
					case OverwriteType.Member:
						return `**Member:** <@${o.id}>\n${output}`;
				}
			});

			for (const override of overrides) {
				fields.push({
					name: "Permission Overwrites",
					value: override,
					inline: true,
				});
			}
		}

		const embed: APIEmbed = {
			title: "Channel Created",
			color: Colors.Green,
			fields,
			timestamp: new Date().toISOString(),
		};

		const author = await channel.guild.fetchAuditLogs({
			type: AuditLogEvent.ChannelCreate,
		});
		const log = author.entries
			.filter((l) => l.target.id === channel.id)
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first();

		if (
			log &&
			log.executor &&
			log.executorId !== channel.guild.id &&
			log.createdTimestamp > Date.now() - 1000 * 60 * 2
		) {
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

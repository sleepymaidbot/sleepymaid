import { Context, Listener } from "@sleepymaid/handler"
import { channelNames } from "@sleepymaid/shared"
import {
	APIEmbed,
	APIEmbedField,
	AuditLogEvent,
	Colors,
	DMChannel,
	NonThreadGuildBasedChannel,
	OverwriteType,
} from "discord.js"
import { WatcherClient } from "../../../lib/extensions/WatcherClient"

export default class extends Listener<"channelUpdate", WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "channelUpdate",
			once: false,
		})
	}

	public override async execute(
		oldChannel: DMChannel | NonThreadGuildBasedChannel,
		newChannel: DMChannel | NonThreadGuildBasedChannel,
	) {
		if (oldChannel instanceof DMChannel || newChannel instanceof DMChannel) return
		if (!oldChannel.guild || !newChannel.guild) return
		const channels = (await this.container.manager.getLogChannel(oldChannel.guild?.id))?.filter(
			(c) => c.channelEvents.delete,
		)
		if (!channels || channels.length === 0) return

		const fields: APIEmbedField[] = []

		fields.push({
			name: "Channel",
			value: `<#${oldChannel.id}> (${oldChannel.id})`,
			inline: true,
		})

		if (oldChannel.name !== newChannel.name) {
			fields.push({
				name: "Name",
				value: `${oldChannel.name} -> ${newChannel.name}`,
				inline: true,
			})
		}

		if ("topic" in oldChannel && "topic" in newChannel && oldChannel.topic !== newChannel.topic) {
			const oldTopic = oldChannel.topic || "None"
			const newTopic = newChannel.topic || "None"

			if (oldTopic !== "None" || newTopic !== "None") {
				fields.push({
					name: "Topic",
					value: `${oldTopic} -> ${newTopic}`,
					inline: true,
				})
			}
		}

		if (oldChannel.position !== newChannel.position) {
			fields.push({
				name: "Position",
				value: `${oldChannel.position} -> ${newChannel.position}`,
				inline: true,
			})
		}

		if (oldChannel.parent !== newChannel.parent) {
			fields.push({
				name: "Category",
				value: `${oldChannel.parent?.name || "None"} -> ${newChannel.parent?.name || "None"}`,
				inline: true,
			})
		}

		if (oldChannel.type !== newChannel.type) {
			fields.push({
				name: "Type",
				value: `${channelNames[oldChannel.type]} -> ${channelNames[newChannel.type]}`,
				inline: true,
			})
		}

		if ("nsfw" in oldChannel && "nsfw" in newChannel && oldChannel.nsfw !== newChannel.nsfw) {
			fields.push({
				name: "NSFW",
				value: `${oldChannel.nsfw ? "Yes" : "No"} -> ${newChannel.nsfw ? "Yes" : "No"}`,
				inline: true,
			})
		}

		const oldOverwrites = oldChannel.permissionOverwrites.cache
		const newOverwrites = newChannel.permissionOverwrites.cache

		for (const [id, overwrite] of newOverwrites) {
			if (!oldOverwrites.has(id)) {
				const allowedPermissions = overwrite.allow.toArray().map((p) => {
					return `<:add:807723944236285972> ${p}`
				})
				const deniedPermissions = overwrite.deny.toArray().map((p) => {
					return `<:remove:807723917925941268> ${p}`
				})
				const output = `\n${allowedPermissions.join("\n")}\n${deniedPermissions.join("\n")}`

				let targetName = ""
				if (overwrite.type === OverwriteType.Role) {
					const role = oldChannel.guild.roles.cache.get(id)
					targetName = role ? role.name : "Unknown Role"
					fields.push({
						name: "Permission Overwrite Added",
						value: `**Role:** <@&${id}> (${targetName})\n${output}`,
						inline: false,
					})
				} else if (overwrite.type === OverwriteType.Member) {
					const member = await oldChannel.guild.members.fetch(id).catch(() => null)
					targetName = member ? member.displayName : "Unknown Member"
					fields.push({
						name: "Permission Overwrite Added",
						value: `**Member:** <@${id}> (${targetName})\n${output}`,
						inline: false,
					})
				}
			}
		}

		for (const [id, overwrite] of oldOverwrites) {
			if (!newOverwrites.has(id)) {
				const allowedPermissions = overwrite.allow.toArray().map((p) => {
					return `<:add:807723944236285972> ${p}`
				})
				const deniedPermissions = overwrite.deny.toArray().map((p) => {
					return `<:remove:807723917925941268> ${p}`
				})
				const output = `\n${allowedPermissions.join("\n")}\n${deniedPermissions.join("\n")}`

				let targetName = ""
				if (overwrite.type === OverwriteType.Role) {
					const role = oldChannel.guild.roles.cache.get(id)
					targetName = role ? role.name : "Unknown Role"
					fields.push({
						name: "Permission Overwrite Removed",
						value: `**Role:** <@&${id}> (${targetName})\n${output}`,
						inline: false,
					})
				} else if (overwrite.type === OverwriteType.Member) {
					const member = await oldChannel.guild.members.fetch(id).catch(() => null)
					targetName = member ? member.displayName : "Unknown Member"
					fields.push({
						name: "Permission Overwrite Removed",
						value: `**Member:** <@${id}> (${targetName})\n${output}`,
						inline: false,
					})
				}
			}
		}

		for (const [id, newOverwrite] of newOverwrites) {
			const oldOverwrite = oldOverwrites.get(id)
			if (
				oldOverwrite &&
				(!oldOverwrite.allow.equals(newOverwrite.allow) || !oldOverwrite.deny.equals(newOverwrite.deny))
			) {
				const oldAllowed = oldOverwrite.allow.toArray().map((p) => {
					return `<:add:807723944236285972> ${p}`
				})
				const oldDenied = oldOverwrite.deny.toArray().map((p) => {
					return `<:remove:807723917925941268> ${p}`
				})
				const newAllowed = newOverwrite.allow.toArray().map((p) => {
					return `<:add:807723944236285972> ${p}`
				})
				const newDenied = newOverwrite.deny.toArray().map((p) => {
					return `<:remove:807723917925941268> ${p}`
				})

				const oldOutput = `\n${oldAllowed.join("\n")}\n${oldDenied.join("\n")}`
				const newOutput = `\n${newAllowed.join("\n")}\n${newDenied.join("\n")}`

				let targetName = ""
				if (newOverwrite.type === OverwriteType.Role) {
					const role = oldChannel.guild.roles.cache.get(id)
					targetName = role ? role.name : "Unknown Role"
					fields.push({
						name: "Permission Overwrite Modified",
						value: `**Role:** <@&${id}> (${targetName})\n**Old:**${oldOutput}\n**New:**${newOutput}`,
						inline: false,
					})
				} else if (newOverwrite.type === OverwriteType.Member) {
					const member = await oldChannel.guild.members.fetch(id).catch(() => null)
					targetName = member ? member.displayName : "Unknown Member"
					fields.push({
						name: "Permission Overwrite Modified",
						value: `**Member:** <@${id}> (${targetName})\n**Old:**${oldOutput}\n**New:**${newOutput}`,
						inline: false,
					})
				}
			}
		}

		if (fields.length <= 1) return

		const embed: APIEmbed = {
			title: "Channel Updated",
			color: Colors.Blurple,
			fields,
			timestamp: new Date().toISOString(),
		}
		const author = await oldChannel.guild.fetchAuditLogs({})
		const log = author.entries
			.filter(
				(l) =>
					l.action === AuditLogEvent.ChannelUpdate ||
					l.action === AuditLogEvent.ChannelOverwriteCreate ||
					l.action === AuditLogEvent.ChannelOverwriteDelete ||
					l.action === AuditLogEvent.ChannelOverwriteUpdate,
			)
			.filter((l) => l.target && "id" in l.target && l.target.id === oldChannel.id)
			.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
			.first()

		if (
			log &&
			log.executor &&
			log.executorId !== oldChannel.guild.id &&
			log.createdTimestamp > Date.now() - 1000 * 60 * 2
		) {
			embed.footer = {
				text: `${log.executor.displayName} (${log.executorId})`,
				icon_url: log.executor.displayAvatarURL(),
			}
		}

		for (const channel of channels) {
			await this.container.manager.sendLog(channel, { embeds: [embed] })
		}
	}
}

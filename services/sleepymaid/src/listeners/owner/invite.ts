import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { Message } from "discord.js"
import { ChannelType } from "discord-api-types/v10"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class InviteCommandListener extends Listener<"messageCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		})
	}

	public override async execute(message: Message) {
		if (message.author.id !== "324281236728053760") return
		const client = this.container.client
		if (!client.user) return
		if (!message.content.startsWith("<@" + client.user.id + "> invite")) return
		const guildId = message.content.split(" ").slice(2).join(" ")

		const guild = await client.guilds.fetch(guildId)
		if (!guild) return

		for (const channel of guild.channels.cache.values()) {
			if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
				const invite = await guild.invites.create(channel.id)
				if (!invite) continue
				const cmdchannel = message.channel
				if (!cmdchannel.isSendable()) return
				await cmdchannel.send(invite.url)
				return
			}
		}
	}
}

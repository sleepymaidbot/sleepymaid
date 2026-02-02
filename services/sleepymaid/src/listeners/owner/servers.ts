import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { Message } from "discord.js"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class ServersCommandListener extends Listener<"messageCreate", SleepyMaidClient> {
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
		if (!message.content.startsWith("<@" + client.user.id + "> servers")) return

		const guilds = await client.guilds.fetch()
		let guildsList = ""
		for (const guild of guilds.values()) {
			guildsList += `${guild.name} (${guild.id})\n`
		}

		const cmdchannel = message.channel
		if (!cmdchannel.isSendable()) return
		await cmdchannel.send(`**Servers**\n${guildsList}`)
	}
}

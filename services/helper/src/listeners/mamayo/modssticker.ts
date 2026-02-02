import { Context, Listener } from "@sleepymaid/handler"
import { add } from "date-fns"
import { Message } from "discord.js"
import { HelperClient } from "../../lib/extensions/HelperClient"

let time = 0

export default class ModStickerListener extends Listener<"messageCreate", HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		})
	}

	public override async execute(message: Message) {
		if (!message.channel.isSendable()) return
		if (!message.guild) return
		if (message.guild.id !== "1150780245151068332") return
		const channel = message.guild.channels.cache.get("1304165003628380230")
		if (!channel || !channel.isSendable()) return
		if (Date.now() < time) return
		for (const [_, sticker] of message.stickers) {
			if (sticker.name !== "Mods!!!!") continue

			await channel.send({
				content: `<@&1301593179216412842> from ${message.author} in ${message.channel}\nhttps://discord.com/channels/${message.guild.id}/${message.channel.id}/${message.id}`,
				allowedMentions: {
					roles: ["1301593179216412842"],
				},
			})

			time = add(new Date(), { minutes: 1 }).getTime()
		}
	}
}

import { Context, Listener } from "@sleepymaid/handler"
import { Message } from "discord.js"
import { HelperClient } from "../../lib/extensions/HelperClient"

const reactions: Record<string, string> = {
	amine: "<:amine:1427832531230789712>",
	hellochat: "<:hellochat:1428060543448645797>",
}

export default class extends Listener<"messageCreate", HelperClient> {
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

		for (const [reaction, emoji] of Object.entries(reactions)) {
			if (message.content.toLocaleLowerCase() === reaction) {
				await message.react(emoji)
			}
		}
	}
}

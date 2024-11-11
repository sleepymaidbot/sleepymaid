import { Context, Listener } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { Message } from "discord.js";
import { add } from "date-fns";

let time = 0;

export default class ModStickerListener extends Listener<"messageCreate", SleepyMaidClient> {
	constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (!message.channel.isSendable()) return;
		if (!message.guild) return;
		if (message.guild.id !== "1150780245151068332") return;
		const channel = message.guild.channels.cache.get("1304165003628380230");
		if (!channel || !channel.isSendable()) return;
		if (Date.now() < time) return;
		for (const [_, sticker] of message.stickers) {
			if (sticker.name !== "Mods!!!!") continue;

			await channel.send({
				content: `<@&1301593179216412842>`,
				allowedMentions: {
					roles: ["1301593179216412842"],
				},
			});

			time = add(new Date(), { minutes: 1 }).getTime();
		}
	}
}

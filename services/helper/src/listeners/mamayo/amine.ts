import { Context, Listener } from "@sleepymaid/handler";
import { Message } from "discord.js";
import { HelperClient } from "../../lib/extensions/HelperClient";

export default class extends Listener<"messageCreate", HelperClient> {
	constructor(context: Context<HelperClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (!message.channel.isSendable()) return;
		if (!message.guild) return;
		//if (message.guild.id !== "1150780245151068332") return;

		if (message.content.includes("amine")) {
			await message.react("<:amine:1427832531230789712>");
		}
	}
}

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
		if (message.author.id !== "577856714347511828") return;
		if (!message.content.includes("feur")) return;

		await message.delete();
	}
}

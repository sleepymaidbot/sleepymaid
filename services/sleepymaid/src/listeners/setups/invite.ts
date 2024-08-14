import { Listener } from "@sleepymaid/handler";
import type { Context } from "@sleepymaid/handler";
import type { Message } from "discord.js";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class SetupListener extends Listener<"messageCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (message.author.id !== "324281236728053760") return;
		const client = this.container.client;
		if (!client.user) return;
		if (!message.content.startsWith("<@" + client.user.id + "> invite")) return;
		const guildId = message.content.split(" ").slice(2).join(" ");

		const guild = await client.guilds.fetch(guildId);
		if (!guild) return;

		const channel = guild.channels.cache.first();
		if (!channel) return;

		const invite = await guild.invites.create(channel.id);
		if (!invite) return;

		await message.channel.send(invite.url);
	}
}

import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { userData } from "@sleepymaid/db";
import { Message } from "discord.js";
import { increment } from "@sleepymaid/shared";

export default class MessageCreateEconomyListener extends Listener<"messageCreate", SleepyMaidClient> {
	private cooldowns = new Map<string, number>();

	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (message.author.bot) return;
		if (message.channel.isDMBased()) return;

		const lastMessage = this.cooldowns.get(message.author.id);
		const now = Date.now();
		if (lastMessage && now - lastMessage < 60000) return; // 60 seconds cooldown

		this.cooldowns.set(message.author.id, now);
		const reward = Math.floor(Math.random() * 3) + 1;

		await this.container.client.drizzle
			.insert(userData)
			.values({
				userId: message.author.id,
				userName: message.author.username,
				displayName: message.author.displayName,
				userAvatar: message.author.avatarURL() ?? null,
				currency: reward,
			})
			.onConflictDoUpdate({
				target: userData.userId,
				set: {
					currency: increment(userData.currency, reward),
				},
			});

		this.container.client.logger.info(
			`${message.author.username} (${message.author.id}) earned ${reward} coins for sending a message!`,
		);
	}
}

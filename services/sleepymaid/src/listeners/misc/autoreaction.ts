import { Context, Listener } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { Message } from "discord.js";
import { eq } from "drizzle-orm";
import { autoReactions } from "@sleepymaid/db";

export default class extends Listener<"messageCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (message.author.bot) return;
		if (message.channel.isDMBased()) return;
		if (!message.guild) return;

		const autoReaction = (
			await this.container.drizzle.select().from(autoReactions).where(eq(autoReactions.guildId, message.guild.id))
		)
			.filter((reaction) => reaction.enabled)
			.sort((a, b) => a.priority - b.priority);

		if (!autoReaction.length) return;

		for (const reaction of autoReaction) {
			if (reaction.channelId === message.channel.id) {
				await message.react(reaction.reactionName).catch(async (e) => {
					if (e.message.includes("Unknown Emoji")) {
						this.container.logger.debug(`Unknown emoji ${reaction.reactionName} for guild ${message.guild!.id}`);
						await this.container.drizzle
							.delete(autoReactions)
							.where(eq(autoReactions.reactionName, reaction.reactionName));
					}
				});
			}
		}
	}
}

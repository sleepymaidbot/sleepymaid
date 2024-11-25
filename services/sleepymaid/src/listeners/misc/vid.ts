import { Result } from "@sapphire/result";
import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { Message } from "discord.js";
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { sitesDelEmbed } from "../../lib/downloader";

const enabled = true;

export default class VidListener extends Listener<"messageCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (!enabled) return;
		if (message.author.bot) return;
		const client = this.container.client;

		const args = message.content.split(" ");

		for (let arg of args) {
			await this.container.manager.downloadVideo(arg, async (fileName) => {
				const messageReturn = await Result.fromAsync(async () =>
					message
						.reply({
							files: [
								{
									attachment: fileName,
									name: fileName,
								},
							],
						})
						.then(() => {
							if (sitesDelEmbed.some((a) => arg.includes(a))) message.suppressEmbeds(true).catch(console.error);
						}),
				);
				if (messageReturn.isErr()) {
					client.logger.error(messageReturn.unwrapErr() as Error);
					return;
				}
			});
		}
	}
}

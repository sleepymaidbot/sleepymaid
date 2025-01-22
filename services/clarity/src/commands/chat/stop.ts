import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { type ChatInputCommandInteraction } from "discord.js";
import { ClarityClient } from "../../lib/ClarityClient";
import { useQueue } from "discord-player";

export default class extends SlashCommand<ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			data: {
				name: "stop",
				description: "Stop the current queue",
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const queue = useQueue();

		if (!queue) {
			return interaction.reply("This server does not have an active player session.");
		}

		queue.node.stop();

		return interaction.reply("The queue has been stopped.");
	}
}

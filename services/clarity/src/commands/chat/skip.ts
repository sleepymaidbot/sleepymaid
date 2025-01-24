import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { type ChatInputCommandInteraction } from "discord.js";
import { ClarityClient } from "../../lib/ClarityClient";
import { useQueue } from "discord-player";

export default class extends SlashCommand<ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			data: {
				name: "skip",
				description: "Skip the current song",
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const queue = useQueue();

		if (!queue) {
			return interaction.reply("This server does not have an active player session.");
		}

		if (!queue.isPlaying()) {
			return interaction.reply("There is no track playing.");
		}

		queue.node.skip();

		return interaction.reply("The current song has been skipped.");
	}
}

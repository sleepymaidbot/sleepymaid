import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { type ChatInputCommandInteraction } from "discord.js";
import { ClarityClient } from "../../lib/ClarityClient";
import { useTimeline } from "discord-player";

export default class extends SlashCommand<ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			data: {
				name: "pause",
				description: "Pause the current song",
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const timeline = useTimeline();

		if (!timeline) {
			return interaction.reply("This server does not have an active player session.");
		}

		const wasPaused = timeline.paused;

		wasPaused ? timeline.resume() : timeline.pause();

		return interaction.reply(`The player is now ${wasPaused ? "playing" : "paused"}.`);
	}
}

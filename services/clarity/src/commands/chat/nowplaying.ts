import { SlashCommand } from "@sleepymaid/handler";
import { type Context } from "@sleepymaid/handler";
import { ClarityClient } from "../../lib/ClarityClient";
import { useQueue } from "discord-player";
import { ChatInputCommandInteraction } from "discord.js";

export default class extends SlashCommand<ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			data: {
				name: "nowplaying",
				description: "Get the current song playing",
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const queue = useQueue();

		if (!queue) {
			return interaction.reply("This server does not have an active player session.");
		}

		const currentSong = queue.currentTrack;

		if (!currentSong) {
			return interaction.reply("No song is currently playing.");
		}

		return interaction.reply(`Now playing: ${currentSong.title}`);
	}
}

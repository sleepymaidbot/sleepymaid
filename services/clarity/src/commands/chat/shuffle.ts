import type { Context } from "@sleepymaid/handler"
import { SlashCommand } from "@sleepymaid/handler"
import { type ChatInputCommandInteraction } from "discord.js"
import { useQueue } from "discord-player"
import { ClarityClient } from "../../lib/ClarityClient"

export default class extends SlashCommand<ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			data: {
				name: "shuffle",
				description: "Shuffle the current queue",
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const queue = useQueue()

		if (!queue) {
			return interaction.reply("This server does not have an active player session.")
		}

		if (queue.tracks.size < 2) return interaction.reply("There are not enough tracks in the queue to shuffle.")

		queue.tracks.shuffle()

		return interaction.reply(`Shuffled ${queue.tracks.size} tracks.`)
	}
}

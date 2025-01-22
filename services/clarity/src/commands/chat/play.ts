import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { ClarityClient } from "../../lib/ClarityClient";
import { useMainPlayer } from "discord-player";

export default class extends SlashCommand<ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			data: {
				name: "play",
				description: "Play a song",
				options: [
					{
						name: "query",
						description: "The song to play",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const player = useMainPlayer();
		const channel = interaction.member.voice.channel;
		if (!channel) return interaction.reply("You are not connected to a voice channel!");
		const query = interaction.options.getString("query", true);

		await interaction.deferReply();

		try {
			const { track } = await player.play(channel, query, {
				nodeOptions: {
					metadata: interaction,
				},
			});

			return interaction.followUp(`**${track.title}** enqueued!`);
		} catch (e) {
			return interaction.followUp(`Something went wrong: ${e}`);
		}
	}
}

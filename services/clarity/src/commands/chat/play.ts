import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";
import { ClarityClient } from "../../lib/ClarityClient";
import { QueryType, useMainPlayer } from "discord-player";

const searchUrls: Record<string | QueryType, string[]> = {
	[QueryType.YOUTUBE_VIDEO]: ["https://www.youtube.com/watch?v=", "https://www.youtube.com/results?search_query="],
	[QueryType.YOUTUBE_SEARCH]: ["https://www.youtube.com/results?search_query="],
	[QueryType.YOUTUBE_PLAYLIST]: ["https://www.youtube.com/playlist?list="],
	[QueryType.APPLE_MUSIC_ALBUM]: ["https://music.apple.com/us/album/"],
	[QueryType.APPLE_MUSIC_SONG]: ["https://music.apple.com/us/song/"],
	[QueryType.APPLE_MUSIC_SEARCH]: ["https://music.apple.com/us/search?term="],
	[QueryType.SOUNDCLOUD_TRACK]: ["https://soundcloud.com/search?q="],
	[QueryType.SOUNDCLOUD_PLAYLIST]: ["https://soundcloud.com/search?q="],
	[QueryType.SOUNDCLOUD_SEARCH]: ["https://soundcloud.com/search?q="],
	[QueryType.SPOTIFY_ALBUM]: ["https://open.spotify.com/album/"],
	[QueryType.SPOTIFY_SONG]: ["https://open.spotify.com/song/"],
	[QueryType.SPOTIFY_SEARCH]: ["https://open.spotify.com/search?q="],
	[QueryType.SPOTIFY_PLAYLIST]: ["https://open.spotify.com/playlist/"],
};

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

		// Get from searchUrls
		const queryType = Object.entries(searchUrls).find(([_, urls]) =>
			urls.some((url) => query.toLowerCase().startsWith(url.toLowerCase())),
		)?.[0];

		console.log(queryType);

		try {
			const { track } = await player.play(channel, query, {
				nodeOptions: {
					metadata: interaction,
				},
				...(queryType && { searchEngine: queryType as QueryType }),
			});

			return interaction.followUp(`**${track.title}** enqueued!`);
		} catch (e) {
			return interaction.followUp(`Something went wrong: ${e}`);
		}
	}
}

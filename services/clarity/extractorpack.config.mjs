import { defineConfig } from "extractorpack";

export default defineConfig({
	"discord-player-deezer": {
		enabled: true,
		options: {
			clientId: process.env.DEEZER_CLIENT_ID,
			clientSecret: process.env.DEEZER_CLIENT_SECRET,
		},
	},
	"discord-player-youtubei": {
		enabled: true,
		options: {
			apiKey: process.env.YOUTUBE_API_KEY,
		},
	},
});

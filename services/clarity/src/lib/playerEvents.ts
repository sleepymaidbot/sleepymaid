import { useMainPlayer } from "discord-player"
import { ClarityClient } from "./ClarityClient"

export async function setupPlayerEvents(client: ClarityClient) {
	const player = useMainPlayer()

	player.events.on("playerStart", (queue, track) => {
		client.logger.info(`Started playing ${track.title}!`)
		queue.metadata.channel.send(`Started playing **${track.title}**!`)
	})
}

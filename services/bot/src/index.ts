import { BotClient } from './lib/BotClient'

void (() => {
	const client: BotClient = new BotClient()

	client.start()
})()

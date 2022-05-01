import { BotClient } from './lib/extensions/BotClient'

void (() => {
	const client: BotClient = new BotClient()

	client.start()
})()

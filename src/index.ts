import { BotClient } from './lib/extensions/BotClient'
import { config } from './config/config'

const client: BotClient = new BotClient()

;(async () => {
	client.loadEvents()
	client.loadDB()
	client.login(config.token)
	client.loadTasks()
	client.loadCommands()
})()

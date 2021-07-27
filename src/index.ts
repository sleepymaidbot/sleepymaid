import { BotClient } from './lib/extensions/BotClient'
import { config } from './config/config'

const client: BotClient = new BotClient(config)
client.start()

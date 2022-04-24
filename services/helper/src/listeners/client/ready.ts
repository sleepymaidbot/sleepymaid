import { Listener } from '@sleepymaid/handler'
import { BotClient } from '../../lib/BotClient'

export default new Listener(
	{
		name: 'ready',
		once: true
	},
	{
		async run(client: BotClient) {
			client.logger.info(
				`Logged in as ${client.user.tag} | ${client.guilds.cache.size} servers`
			)
		}
	}
)

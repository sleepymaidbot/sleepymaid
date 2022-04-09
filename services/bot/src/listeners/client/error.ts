import { Listener } from '@sleepymaid/handler'
import { BotClient } from '../../lib/BotClient'

export default new Listener(
	{
		name: 'error',
		once: false
	},
	{
		run(client: BotClient, error: Error) {
			return client.logger.error(error)
		}
	}
)

import { Listener } from '@sleepymaid/handler'
import { BotClient } from '../../lib/BotClient'

export default new Listener(
	{
		name: 'error',
		once: false
	},
	{
		run(error: Error, client: BotClient) {
			return client.logger.error(error)
		}
	}
)

import { Listener } from '@sleepymaid/handler'
import { BotClient } from '../../lib/BotClient'

export default new Listener(
	{
		name: 'debug',
		once: false
	},
	{
		run(info, client: BotClient) {
			return client.logger.debug(info)
		}
	}
)
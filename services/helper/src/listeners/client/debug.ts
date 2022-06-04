import { Listener } from '@sleepymaid/handler'
import { HelperClient } from '../../lib/HelperClient'

export default new Listener(
	{
		name: 'debug',
		once: false
	},
	{
		run(info, client: HelperClient) {
			if (client.config.environment === 'development')
				return client.logger.debug(info)
		}
	}
)

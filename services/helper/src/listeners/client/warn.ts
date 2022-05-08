import { Listener } from '@sleepymaid/handler'
import { HelperClient } from '../../lib/HelperClient'

export default new Listener(
	{
		name: 'warn',
		once: false
	},
	{
		run(info, client: HelperClient) {
			return client.logger.debug(info)
		}
	}
)

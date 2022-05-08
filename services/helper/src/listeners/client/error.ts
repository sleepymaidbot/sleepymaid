import { Listener } from '@sleepymaid/handler'
import { HelperClient } from '../../lib/HelperClient'

export default new Listener(
	{
		name: 'error',
		once: false
	},
	{
		run(error: Error, client: HelperClient) {
			return client.logger.error(error)
		}
	}
)

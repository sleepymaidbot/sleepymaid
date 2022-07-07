import { ListenerInterface } from '@sleepymaid/handler'
import { HelperClient } from '../../lib/HelperClient'

export default class WarnListener implements ListenerInterface {
	public readonly name = 'warn'
	public readonly once = false

	public async execute(warn: string, client: HelperClient) {
		client.logger.error(warn)
	}
}

/*export default new Listener(
	{
		name: 'error',
		once: false
	},
	{
		run(error: Error, client: HelperClient) {
			return client.logger.error(error)
		}
	}
)*/

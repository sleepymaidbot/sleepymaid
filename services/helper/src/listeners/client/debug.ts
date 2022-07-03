import { ListenerInterface } from '@sleepymaid/handler'
import { HelperClient } from '../../lib/HelperClient'

export default class DebugListener implements ListenerInterface {
	public readonly name = 'debug'
	public readonly once = false

	public async execute(info: string, client: HelperClient) {
		client.logger.debug(info)
	}
}

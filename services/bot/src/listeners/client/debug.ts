import { ListenerInterface } from '@sleepymaid/handler'
import { BotClient } from '../../lib/extensions/BotClient'

export default class DebugListener implements ListenerInterface {
	public readonly name = 'debug'
	public readonly once = false

	public async execute(info: string, client: BotClient) {
		if (client.config.environment === 'development') client.logger.debug(info)
	}
}

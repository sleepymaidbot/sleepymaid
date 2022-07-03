import { ListenerInterface } from '@sleepymaid/handler'
import { BotClient } from '../../lib/extensions/BotClient'

export default class ErrorListener implements ListenerInterface {
	public readonly name = 'error'
	public readonly once = false

	public async execute(error: Error, client: BotClient) {
		client.logger.error(error)
	}
}

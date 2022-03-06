import { BotClient } from '../../lib/BotClient'

module.exports = {
	name: 'error',
	once: false,

	execute(error: Error, client: BotClient) {
		client.logger.error(error)
	}
}

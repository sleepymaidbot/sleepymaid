import { BotClient } from '../../lib/BotClient'

module.exports = {
	name: 'debug',
	once: false,

	execute(info, client: BotClient) {
		client.logger.debug(info)
	}
}

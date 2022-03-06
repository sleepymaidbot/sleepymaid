import { BotClient } from '../../lib/BotClient'

module.exports = {
	name: 'warn',
	once: false,

	execute(info, client: BotClient) {
		client.logger.debug(info)
	}
}

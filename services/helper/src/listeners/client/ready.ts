import { Listener } from '@sleepymaid/handler'
import { HelperClient } from '../../lib/HelperClient'

export default new Listener(
	{
		name: 'ready',
		once: true
	},
	{
		async run(client: HelperClient) {
			client.logger.info(
				`Logged in as ${client.user.tag} | ${client.guilds.cache.size} servers`
			)
		}
	}
)

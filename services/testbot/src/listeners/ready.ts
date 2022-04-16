import { HandlerClient, Listener } from '@sleepymaid/handler'
import { Guild } from 'discord.js'
export default new Listener(
	{
		name: 'ready',
		once: false
	},
	{
		run: async function run(client: HandlerClient) {
			client.logger.info('Listener ran')
			const guilds = await client.guilds.fetch()
			for (const guild of guilds.values()) {
				const g: Guild = await client.guilds.fetch(guild.id)

				await g.members.fetch().catch((e) => client.logger.error(e))
			}
			client.logger.info('in guilds', client.guilds.cache.size.toString())
		}
	}
)

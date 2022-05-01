import { Listener } from '@sleepymaid/handler'
import { Guild } from 'discord.js'
import { BotClient } from '../../lib/extensions/BotClient'

export default new Listener(
	{
		name: 'guildCreate',
		once: false
	},
	{
		async run(guild: Guild, client: BotClient) {
			return await client.prisma.guilds_settings.create({
				data: {
					guild_id: guild.id
				}
			})
		}
	}
)

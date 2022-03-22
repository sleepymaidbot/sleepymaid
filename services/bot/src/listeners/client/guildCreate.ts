import { Guild } from 'discord.js'
import { BotClient } from '../../lib/BotClient'

module.exports = {
	name: 'guildCreate',
	once: false,

	async execute(client: BotClient, guild: Guild) {
		return await client.prisma.guilds_settings.create({
			data: {
				guild_id: guild.id
			}
		})
	}
}

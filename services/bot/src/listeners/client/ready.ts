import { guilds_settings } from '@prisma/client'
import { Guild } from 'discord.js'
import { BotClient } from '../../lib/BotClient'

module.exports = {
	name: 'ready',
	once: true,

	async execute(client: BotClient) {
		client.logger.info(
			`Logged in as ${client.user.tag} | ${client.guilds.cache.size} servers`
		)

		await client.guilds
			.fetch()
			.then(async (guilds) => {
				for (const guild of guilds.values()) {
					const g: Guild = await client.guilds.fetch(guild.id)

					await g.members.fetch().catch((e) => client.logger.error(e))
				}
				const guildSettings: Array<guilds_settings> =
					await client.prisma.guilds_settings.findMany()

				const guildsInDb: Array<string> = guildSettings.map(
					(guild) => guild.guild_id
				)

				const notInDbGuilds = client.guilds.cache
					.filter((g) => !guildsInDb.includes(g.id))
					.map((g) => {
						return { guild_id: g.id }
					})

				if (notInDbGuilds.length < 0) return

				await client.prisma.guilds_settings.createMany({
					data: notInDbGuilds
				})
			})
			.catch((e) => client.logger.error(e))
	}
}

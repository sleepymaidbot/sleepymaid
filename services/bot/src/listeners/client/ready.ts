import { GuildsSettings } from '@prisma/client'
import { ListenerInterface } from '@sleepymaid/handler'
import { Guild } from 'discord.js'
import { BotClient } from '../../lib/extensions/BotClient'

export default class ReadyListener implements ListenerInterface {
	public readonly name = 'ready'
	public readonly once = true

	public async execute(client: BotClient) {
		client.logger.info(
			`Logged in as ${client.user.tag} | ${client.guilds.cache.size} servers`
		)

		const guilds = await client.guilds.fetch()
		for (const guild of guilds.values()) {
			const g: Guild = await client.guilds.fetch(guild.id)

			await g.members.fetch().catch((e) => client.logger.error(e))
		}
		const guildSettings: Array<GuildsSettings> =
			await client.prisma.guildsSettings.findMany()

		const guildsInDb: Array<string> = guildSettings.map(
			(guild) => guild.guildId
		)

		const notInDbGuilds = client.guilds.cache
			.filter((g) => !guildsInDb.includes(g.id))
			.map((g) => {
				return { guildId: g.id }
			})

		if (notInDbGuilds.length < 0) return

		await client.prisma.guildsSettings.createMany({
			data: notInDbGuilds
		})
	}
}

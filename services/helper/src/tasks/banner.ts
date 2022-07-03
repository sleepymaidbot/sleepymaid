import { opendir } from 'fs/promises'
import { TaskInterface } from '@sleepymaid/handler'
import { HelperClient } from '../lib/HelperClient'
import { TextChannel } from 'discord.js'

export default class BannerTask implements TaskInterface {
	public readonly interval = 3600000
	public async execute(client: HelperClient) {
		if (client.config.environment === 'development') return
		const guild = client.guilds.cache.get('324284116021542922')
		if (guild.premiumSubscriptionCount < 7) return
		client.logger.debug('Banner task started')
		try {
			const dir = await opendir('./banners')
			const banners = []
			for await (const dirent of dir) {
				if (dirent.name.endsWith('.png')) banners.push(dirent.name)
			}

			const banner = banners[Math.floor(Math.random() * banners.length)]

			guild
				.setBanner(`./banners/${banner}`, `Changed banner to ${banner}`)
				.catch(console.error)

			const channel = guild.channels.cache.get(
				'863117686334554142'
			) as TextChannel

			channel.send(`**Banner Rotation**\nBanner is now \`\`${banner}\`\``)
		} catch (err) {
			console.error(err)
		}
	}
}

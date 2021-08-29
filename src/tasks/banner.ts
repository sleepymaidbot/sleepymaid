import { opendir } from 'fs/promises'
import { config } from '../config/config'

module.exports = {
	interval: 3600000,

	async execute(client) {
		client.logger.debug('Banner task started')
		if (config.isDevelopment) return
		const guild = client.guilds.cache.get('324284116021542922')
		if (guild.premiumSubscriptionCount < 15) return
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
		} catch (err) {
			console.error(err)
		}
	}
}

import { Task } from 'discord-akairo'
import { opendir } from 'fs/promises'
import { config } from '../config/config'

export default class banner extends Task {
	constructor() {
		super('banner', {
			delay: 3600000,
			runOnStart: false
		})
	}

	async exec() {
		if (config.isDevelopment) return
		const guild = this.client.guilds.cache.get('324284116021542922')
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

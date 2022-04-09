import { opendir } from 'fs/promises'
import { config } from '@sleepymaid/config'
import { Task } from '@sleepymaid/handler'
import { BotClient } from '../../lib/BotClient'
import { TextChannel } from 'discord.js'

export default new Task(
	{
		interval: 3600000
	},
	{
		async run(client: BotClient) {
			client.logger.debug('Banner task started')
			if (config.isDevelopment) return
			const guild = client.guilds.cache.get('324284116021542922')
			if (guild.premiumSubscriptionCount < 7) return
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
)

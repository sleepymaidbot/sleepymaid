import { opendir } from 'fs/promises'
import { TaskInterface } from '@sleepymaid/handler'
import { HelperClient } from '../lib/extensions/HelperClient'
import { Channel, ChannelType, TextChannel } from 'discord.js'

function isTextChannel(channel: Channel): channel is TextChannel {
	return channel.type == ChannelType.GuildText
}

export default class BannerTask implements TaskInterface {
	public readonly interval = '0 * * * *'
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
				.catch(client.logger.error)

			const channel = guild.channels.cache.get('863117686334554142')
			if (!isTextChannel(channel)) return

			channel.send(`**Banner Rotation**\nBanner is now \`\`${banner}\`\``)
		} catch (err) {
			client.logger.error(err)
		}
	}
}

import { opendir } from 'node:fs/promises';
import type { TaskInterface } from '@sleepymaid/handler';
import type { HelperClient } from '../lib/extensions/HelperClient';
import { Channel, ChannelType, TextChannel } from 'discord.js';
import { join } from 'node:path';

function isTextChannel(channel: Channel): channel is TextChannel {
	return channel.type == ChannelType.GuildText;
}

export default class BannerTask implements TaskInterface {
	public readonly interval = '0 * * * *';
	// @ts-ignore
	public async execute(client: HelperClient) {
		if (client.config.nodeEnv === 'dev') return;
		const guild = client.guilds.cache.get('324284116021542922');
		if (!guild?.premiumSubscriptionCount) return;
		if (guild.premiumSubscriptionCount < 7) return;
		client.logger.debug('Banner task started');
		try {
			const dir = await opendir(join(__dirname, '../../banners'));
			const banners = [];
			for await (const dirent of dir) {
				if (dirent.name.endsWith('.png')) banners.push(dirent.name);
			}

			const banner = banners[Math.floor(Math.random() * banners.length)];

			guild
				?.setBanner(join(__dirname, `../../banners/${banner}`), `Changed banner to ${banner}`)
				.catch(client.logger.error);

			const channel = guild?.channels.cache.get('863117686334554142');
			if (!channel || !isTextChannel(channel)) return;

			channel.send(`**Banner Rotation**\nBanner is now \`\`${banner}\`\``);
		} catch (err) {
			client.logger.error(err as Error);
		}
	}
}

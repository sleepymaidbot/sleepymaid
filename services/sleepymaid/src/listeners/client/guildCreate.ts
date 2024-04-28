import { guildsSettings } from '@sleepymaid/db';
import type { ListenerInterface } from '@sleepymaid/handler';
import type { Guild } from 'discord.js';
import type { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';

export default class GuildCreateListener implements ListenerInterface {
	public readonly name = 'guildCreate';

	public readonly once = false;

	public async execute(guild: Guild, client: SleepyMaidClient) {
		return client.drizzle
			.insert(guildsSettings)
			.values({ guildId: guild.id, guildName: guild.name, guildIcon: guild.iconURL() });
	}
}

import type { ListenerInterface } from '@sleepymaid/handler';
import type { Guild } from 'discord.js';
import type { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';
import { guildsSettings } from '@sleepymaid/db';

export default class GuildCreateListener implements ListenerInterface {
	public readonly name = 'guildCreate';
	public readonly once = false;

	public async execute(guild: Guild, client: SleepyMaidClient) {
		return await client.drizzle.insert(guildsSettings).values({ guildId: guild.id });
	}
}

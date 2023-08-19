import type { ListenerInterface } from '@sleepymaid/handler';
import type { Guild } from 'discord.js';
import type { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';

export default class GuildCreateListener implements ListenerInterface {
	public readonly name = 'guildCreate';
	public readonly once = false;

	public async execute(guild: Guild, client: SleepyMaidClient) {
		return await client.prisma.guildsSettings.create({
			data: {
				guildId: guild.id,
			},
		});
	}
}

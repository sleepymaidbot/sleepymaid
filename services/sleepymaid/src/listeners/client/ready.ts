import type { ListenerInterface } from '@sleepymaid/handler';
import type { Guild } from 'discord.js';
import type { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';
import { guildsSettings } from '@sleepymaid/db';

export default class ReadyListener implements ListenerInterface {
	public readonly name = 'ready';
	public readonly once = true;

	public async execute(client: SleepyMaidClient) {
		client.logger.info(`Logged in as ${client.user!.tag} | ${client.guilds.cache.size} servers`);

		const guilds = await client.guilds.fetch();
		for (const guild of guilds.values()) {
			const g: Guild = await client.guilds.fetch(guild.id);

			await g.members.fetch().catch((e) => client.logger.error(e));
		}
		const guildSettings = await client.drizzle.select().from(guildsSettings);

		const guildsInDb = guildSettings.map((guild) => guild.guildId);

		const notInDbGuilds = client.guilds.cache
			.filter((g) => !guildsInDb.includes(g.id))
			.map((g) => {
				return { guildId: g.id };
			});

		if (notInDbGuilds.length < 0) return;

		await client.drizzle.insert(guildsSettings).values(notInDbGuilds);
	}
}

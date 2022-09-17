import { ListenerInterface } from '@sleepymaid/handler';
import { Guild } from 'discord.js';
import { BotClient } from '../../lib/extensions/BotClient';

export default class GuildCreateListener implements ListenerInterface {
	public readonly name = 'guildCreate';
	public readonly once = false;

	public async execute(guild: Guild, client: BotClient) {
		return await client.prisma.guildsSettings.create({
			data: {
				guildId: guild.id,
			},
		});
	}
}

import { HandlerClient, ListenerInterface } from '@sleepymaid/handler';
import { injectable } from 'tsyringe';

@injectable()
export default class ReadyListener implements ListenerInterface {
	public readonly name = 'ready';
	public readonly once = false;

	public async execute(client: HandlerClient) {
		client.logger.info('Listener ran');
		const guilds = await client.guilds.fetch();
		for (const guild of guilds.values()) {
			const g = await client.guilds.fetch(guild.id);

			await g.members.fetch().catch((e) => client.logger.error(e));
		}
		client.logger.info('in guilds', client.guilds.cache.size.toString());
	}
}

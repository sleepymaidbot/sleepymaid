import type { ListenerInterface } from '@sleepymaid/handler';
import type { BotClient } from '../../lib/extensions/BotClient';

export default class DebugListener implements ListenerInterface {
	public readonly name = 'debug';
	public readonly once = false;

	public async execute(info: string, client: BotClient) {
		if (client.config.nodeEnv === 'dev') client.logger.debug(info);
	}
}

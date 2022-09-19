import type { ListenerInterface } from '@sleepymaid/handler';
import type { BotClient } from '../../lib/extensions/BotClient';

export default class WarnListener implements ListenerInterface {
	public readonly name = 'warn';
	public readonly once = false;

	public async execute(warn: string, client: BotClient) {
		client.logger.debug(warn);
	}
}

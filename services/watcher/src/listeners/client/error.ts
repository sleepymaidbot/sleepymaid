import type { ListenerInterface } from '@sleepymaid/handler';
import type { WatcherClient } from '../../lib/extensions/WatcherClient';

export default class WarnListener implements ListenerInterface {
	public readonly name = 'warn';
	public readonly once = false;

	public async execute(warn: string, client: WatcherClient) {
		client.logger.error(warn);
	}
}

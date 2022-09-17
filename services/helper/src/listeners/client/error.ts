import { ListenerInterface } from '@sleepymaid/handler';
import { HelperClient } from '../../lib/extensions/HelperClient';

export default class WarnListener implements ListenerInterface {
	public readonly name = 'warn';
	public readonly once = false;

	public async execute(warn: string, client: HelperClient) {
		client.logger.error(warn);
	}
}

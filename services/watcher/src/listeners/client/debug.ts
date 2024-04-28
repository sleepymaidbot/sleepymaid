import type { ListenerInterface } from "@sleepymaid/handler";
import type { WatcherClient } from "../../lib/extensions/WatcherClient";

export default class DebugListener implements ListenerInterface {
	public readonly name = "debug";
	public readonly once = false;

	public async execute(info: string, client: WatcherClient) {
		//if (client.config.nodeEnv === 'dev')
		client.logger.debug(info);
	}
}

import type { ListenerInterface } from "@sleepymaid/handler";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class WarnListener implements ListenerInterface {
	public readonly name = "warn";
	public readonly once = false;

	public async execute(warn: string, client: SleepyMaidClient) {
		client.logger.debug(warn);
	}
}

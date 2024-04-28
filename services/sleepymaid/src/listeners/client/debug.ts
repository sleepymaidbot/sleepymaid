import type { ListenerInterface } from "@sleepymaid/handler";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class DebugListener implements ListenerInterface {
	public readonly name = "debug";
	public readonly once = false;

	public async execute(info: string, client: SleepyMaidClient) {
		if (client.config.nodeEnv === "dev") client.logger.debug(info);
	}
}

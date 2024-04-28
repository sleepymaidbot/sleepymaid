import type { ListenerInterface } from "@sleepymaid/handler";
import type { HelperClient } from "../../lib/extensions/HelperClient";

export default class WarnListener implements ListenerInterface {
	public readonly name = "warn";
	public readonly once = false;

	public async execute(warn: string, client: HelperClient) {
		client.logger.debug(warn);
	}
}

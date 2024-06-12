import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { HelperClient } from "../../lib/extensions/HelperClient";

export default class DebugListener extends Listener<"debug", HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			name: "debug",
			once: false,
		});
	}

	public override execute(info: string) {
		if (this.container.client.config.nodeEnv === "dev") this.container.logger.debug(info);
	}
}

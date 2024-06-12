import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class DebugListener extends Listener<"debug", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "debug",
			once: false,
		});
	}

	public override execute(info: string) {
		if (this.container.client.config.nodeEnv === "dev") this.container.client.logger.debug(info);
	}
}

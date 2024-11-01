import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";

export default class ErrorListener extends Listener<"error", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "error",
			once: false,
		});
	}

	public override execute(error: Error) {
		this.container.logger.error(error);
	}
}

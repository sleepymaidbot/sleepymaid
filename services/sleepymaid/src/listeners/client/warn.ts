import type { Context } from "@sleepymaid/handler"
import { Listener } from "@sleepymaid/handler"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class WarnListener extends Listener<"warn", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "warn",
			once: false,
		})
	}

	public override execute(warn: string) {
		this.container.logger.debug(warn)
	}
}

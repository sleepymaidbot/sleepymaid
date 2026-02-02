import { type Context, Listener } from "@sleepymaid/handler"
import type { HelperClient } from "../../lib/extensions/HelperClient"

export default class WarnListener extends Listener<"warn", HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			name: "warn",
			once: false,
		})
	}

	public override execute(warn: string) {
		this.container.logger.debug(warn)
	}
}

import { Context, Listener } from "@sleepymaid/handler"
import type { WatcherClient } from "../../lib/extensions/WatcherClient"

export default class WarnListener extends Listener<"warn", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "warn",
			once: true,
		})
	}

	public override async execute(warn: string) {
		this.container.client.logger.error(warn)
	}
}

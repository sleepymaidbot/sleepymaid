import { type Context, Listener } from "@sleepymaid/handler"
import type { WatcherClient } from "../../lib/extensions/WatcherClient"

export default class DebugListener extends Listener<"debug", WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			name: "debug",
			once: true,
		})
	}

	public override async execute(info: string) {
		//if (client.config.nodeEnv === 'dev')
		this.container.client.logger.debug(info)
	}
}

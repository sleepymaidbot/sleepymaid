import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import type { ThreadChannel } from "discord.js";
import type { SleepyMaidClient } from "../../lib/extensions/SleepyMaidClient";

export default class ThreadListener extends Listener<"threadCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "threadCreate",
			once: false,
		});
	}

	public override async execute(thread: ThreadChannel) {
		// eslint-disable-next-line unicorn/require-array-join-separator
		await thread.join();
	}
}

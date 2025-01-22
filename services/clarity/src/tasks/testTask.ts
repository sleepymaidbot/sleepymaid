import type { Context } from "@sleepymaid/handler";
import { Task } from "@sleepymaid/handler";
import type { ClarityClient } from "../lib/ClarityClient";

export default class TestTask extends Task<ClarityClient> {
	public constructor(context: Context<ClarityClient>) {
		super(context, {
			interval: "* * * * *",
		});
	}

	public override execute() {
		this.container.client.logger.info("Test task ran");
	}
}

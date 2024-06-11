import type { Context } from "@sleepymaid/handler";
import { Task } from "@sleepymaid/handler";
import type { TestClient } from "../lib/extensions/TestClient";

export default class TestTask extends Task<TestClient> {
	public constructor(context: Context<TestClient>) {
		super(context, {
			interval: "* * * * *",
		});
	}

	public override execute() {
		this.container.client.logger.info("Test task ran");
	}
}

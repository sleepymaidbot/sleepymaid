import { BaseContainer } from "@sleepymaid/handler";
import { SleepyMaidClient } from "./SleepyMaidClient";

export default class SleepyMaidContainer extends BaseContainer<SleepyMaidClient> {
	constructor(client: SleepyMaidClient) {
		super(client);
	}
}

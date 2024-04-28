import { singleton } from "tsyringe";
import { SleepyMaidClient } from "../extensions/SleepyMaidClient";

@singleton()
export class baseManager {
	public declare client: SleepyMaidClient;
	constructor(client: SleepyMaidClient) {
		this.client = client;
	}
}

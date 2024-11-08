import { BaseContainer } from "@sleepymaid/handler";
import { SleepyMaidClient } from "./SleepyMaidClient";
import Manager from "../manager";

export default class SleepyMaidContainer extends BaseContainer<SleepyMaidClient> {
	public declare manager: Manager;

	constructor(client: SleepyMaidClient) {
		super(client);
		this.manager = new Manager(client);
	}
}

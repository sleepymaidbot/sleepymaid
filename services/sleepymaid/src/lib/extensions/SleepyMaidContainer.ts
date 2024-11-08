import { BaseContainer } from "@sleepymaid/handler";
import { SleepyMaidClient } from "./SleepyMaidClient";
import Manager from "../manager";
import { DrizzleInstance } from "@sleepymaid/db";

export default class SleepyMaidContainer extends BaseContainer<SleepyMaidClient> {
	public declare drizzle: DrizzleInstance;

	public declare manager: Manager;

	constructor(client: SleepyMaidClient) {
		super(client);
		this.drizzle = client.drizzle;
		this.manager = new Manager(client);
	}
}

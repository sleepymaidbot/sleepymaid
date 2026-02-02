import { DrizzleInstance } from "@sleepymaid/db"
import { BaseContainer } from "@sleepymaid/handler"
import Manager from "./manager"
import { SleepyMaidClient } from "./SleepyMaidClient"

export default class SleepyMaidContainer extends BaseContainer<SleepyMaidClient> {
	public declare drizzle: DrizzleInstance

	public declare manager: Manager

	constructor(client: SleepyMaidClient) {
		super(client)
		this.drizzle = client.drizzle
		this.manager = new Manager(client)
	}
}

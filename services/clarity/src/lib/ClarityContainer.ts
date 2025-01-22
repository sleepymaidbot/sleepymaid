import { BaseContainer } from "@sleepymaid/handler";
import { ClarityClient } from "./ClarityClient";
import Manager from "./manager";
import { DrizzleInstance } from "@sleepymaid/db";

export default class ClarityContainer extends BaseContainer<ClarityClient> {
	declare public drizzle: DrizzleInstance;

	declare public manager: Manager;

	constructor(client: ClarityClient) {
		super(client);
		this.drizzle = client.drizzle;
		this.manager = new Manager(client);
	}
}

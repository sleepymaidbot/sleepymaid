import { ClarityClient } from "./ClarityClient";

import { DrizzleInstance } from "@sleepymaid/db";

export default class Manager {
	declare private client: ClarityClient;

	declare private drizzle: DrizzleInstance;

	constructor(client: ClarityClient) {
		this.client = client;
		this.drizzle = client.drizzle;
	}
}

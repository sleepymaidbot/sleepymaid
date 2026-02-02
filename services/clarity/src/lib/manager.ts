import { ClarityClient } from "./ClarityClient"
// import { DrizzleInstance } from "@sleepymaid/db";

export default class Manager {
	private declare client: ClarityClient

	// declare private drizzle: DrizzleInstance;

	constructor(client: ClarityClient) {
		this.client = client
		// this.drizzle = client.drizzle;
	}
}

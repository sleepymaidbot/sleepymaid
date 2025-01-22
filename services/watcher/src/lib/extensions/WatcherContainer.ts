import { DrizzleInstance } from "@sleepymaid/db";
import { WatcherClient } from "./WatcherClient";
import Manager from "./manager";
import { BaseContainer } from "@sleepymaid/handler";
import { Redis } from "iovalkey";

export default class WatcherContainer extends BaseContainer<WatcherClient> {
	declare public drizzle: DrizzleInstance;

	declare public manager: Manager;

	declare public redis: Redis;

	constructor(client: WatcherClient) {
		super(client);
		this.drizzle = client.drizzle;
		this.manager = new Manager(client);
		this.redis = client.redis;
	}
}

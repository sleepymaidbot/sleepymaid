import { singleton } from "tsyringe";
import { HelperClient } from "../extensions/HelperClient";

@singleton()
export class baseManager {
	declare public client: HelperClient;
	constructor(client: HelperClient) {
		this.client = client;
	}
}

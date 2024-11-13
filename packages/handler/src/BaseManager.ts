import type { HandlerClient } from "./HandlerClient";

export class BaseManager<Client extends HandlerClient> {
	declare client: Client;
	constructor(client: Client) {
		this.client = client;
	}
}

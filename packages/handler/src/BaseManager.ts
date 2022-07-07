import { HandlerClient } from './HandlerClient'

export class BaseManager {
	declare client: HandlerClient
	constructor(client: HandlerClient) {
		this.client = client
	}
}

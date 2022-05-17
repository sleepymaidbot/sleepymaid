import { BotClient } from '../extensions/BotClient'

export class BaseManager {
	public declare client: BotClient
	constructor(client: BotClient) {
		this.client = client
	}
}

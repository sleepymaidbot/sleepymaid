import { BotClient } from '../extensions/BotClient'

export class baseManager {
	public declare client: BotClient
	constructor(client: BotClient) {
		this.client = client
	}
}

import { singleton } from 'tsyringe';
import { BotClient } from '../extensions/BotClient';

@singleton()
export class baseManager {
	public declare client: BotClient;
	constructor(client: BotClient) {
		this.client = client;
	}
}

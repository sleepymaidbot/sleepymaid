import { Client, ClientOptions } from 'discord.js'
import { Logger } from '../logger/logger'

export class BotClient extends Client {
	logger: Logger
	constructor(opts: ClientOptions) {
		super(opts)
		this.logger = new Logger('Sleepy Maid')
	}
}

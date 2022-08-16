import { HandlerClient, TaskInterface } from '@sleepymaid/handler'
import { injectable } from 'tsyringe'

@injectable()
export default class TestTask implements TaskInterface {
	public readonly interval = '* * * * *'
	public execute(client: HandlerClient) {
		client.logger.info('Task ran')
	}
}

import { Task } from '@sleepymaid-ts/handler'

export default new Task(
	{
		interval: 100000
	},
	{
		run: (client) => {
			client.logger.info('Task ran')
		}
	}
)

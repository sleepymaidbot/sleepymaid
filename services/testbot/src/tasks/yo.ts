import { Task } from '@sleepymaid-ts/handler'

export default new Task(
	{
		interval: 1000
	},
	{
		run: (client) => {
			client.logger.info('Task ran')
		}
	}
)

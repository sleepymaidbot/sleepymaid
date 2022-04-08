import { Task } from '@sleepymaid/handler'

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

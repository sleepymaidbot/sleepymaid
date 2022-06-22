import { Listener } from '@sleepymaid/handler'

export default new Listener(
	{
		name: 'threadCreate',
		once: false
	},
	{
		async run(thread) {
			thread.join()
		}
	}
)

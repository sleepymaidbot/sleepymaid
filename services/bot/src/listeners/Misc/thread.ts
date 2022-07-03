import { ListenerInterface } from '@sleepymaid/handler'

export default class ThreadListener implements ListenerInterface {
	public readonly name = 'threadCreate'
	public readonly once = false

	public async execute(thread) {
		thread.join()
	}
}

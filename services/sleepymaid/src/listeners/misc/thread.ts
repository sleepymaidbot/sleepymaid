import type { ListenerInterface } from '@sleepymaid/handler';
import type { ThreadChannel } from 'discord.js';

export default class ThreadListener implements ListenerInterface {
	public readonly name = 'threadCreate';
	public readonly once = false;

	public async execute(thread: ThreadChannel) {
		thread.join();
	}
}

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Listener } from 'discord-akairo';

export default class ReadyListener extends Listener {
	constructor() {
		super('ready', {
			emitter: 'client',
			event: 'ready'
		});
	}

	exec() {
		console.log(
			`Logged in as ${this.client.user.tag} | ${this.client.guilds.cache.size} servers`
		);
		this.client.user.setActivity('yo allo ?', { type: 'WATCHING' });
	}
}

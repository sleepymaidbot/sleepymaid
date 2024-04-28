import type { ListenerInterface } from '@sleepymaid/handler';
import { HelperClient } from '../../lib/extensions/HelperClient';
import sanitize from '@aero/sanitizer';

export default class WelcomeListener implements ListenerInterface {
	public readonly name = 'ready';
	public readonly once = true;

	public async execute(client: HelperClient) {
		const guild = client.guilds.cache.get('1150379660128047104');
		if (!guild) return;
		for (const channel of guild.channels.cache.values()) {
			const sanitized = sanitize(channel.name);
			if (channel.name !== sanitized) await channel.setName(sanitized, 'Sanitizer');
		}
	}
}

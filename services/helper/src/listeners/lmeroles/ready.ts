import 'reflect-metadata';
import type { ListenerInterface } from '@sleepymaid/handler';
import { container } from 'tsyringe';
import { HelperClient } from '../../lib/extensions/HelperClient';
import { ServerRoleSyncerManager } from '../../lib/managers/lmeroles/roleSyncerManagers';

export default class readyRoleSync implements ListenerInterface {
	public readonly name = 'ready';
	public readonly once = true;

	public async execute(client: HelperClient) {
		const guild = client.guilds.cache.get('324284116021542922');
		if (!guild) return;

		container.register(HelperClient, { useValue: client });
		container.resolve(ServerRoleSyncerManager).reloadSeparatorRoles(guild);
	}
}

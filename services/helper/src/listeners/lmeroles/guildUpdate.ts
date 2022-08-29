import 'reflect-metadata'
import { ListenerInterface } from '@sleepymaid/handler'
import { Role } from 'discord.js'
import { container } from 'tsyringe'
import { HelperClient } from '../../lib/extensions/HelperClient'
import { ServerRoleSyncerManager } from '../../lib/managers/lmeroles/roleSyncerManagers'

export default class guildUpdate implements ListenerInterface {
	public readonly name = 'roleUpdate'
	public readonly once = false

	public async execute(oldRole: Role, newRole: Role, client: HelperClient) {
		if (newRole.guild.id !== '324284116021542922') return

		container.register(HelperClient, { useValue: client })
		container
			.resolve(ServerRoleSyncerManager)
			.reloadSeparatorRoles(newRole.guild)
	}
}

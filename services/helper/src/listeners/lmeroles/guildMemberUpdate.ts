import 'reflect-metadata';
import type { ListenerInterface } from '@sleepymaid/handler';
import type { GuildMember } from 'discord.js';
import { container } from 'tsyringe';
import { HelperClient } from '../../lib/extensions/HelperClient';
import { UserRoleSyncerManager } from '../../lib/managers/lmeroles/roleSyncerManagers';

export default class RoleSyncerListener implements ListenerInterface {
	public readonly name = 'guildMemberUpdate';
	public readonly once = false;

	public async execute(oldMember: GuildMember, newMember: GuildMember, client: HelperClient): Promise<void> {
		if (newMember.guild.id !== '324284116021542922') return;
		if (oldMember.roles.cache.size === newMember.roles.cache.size) return;

		container.register(HelperClient, { useValue: client });
		container.resolve(UserRoleSyncerManager).syncRoles(newMember);
	}
}

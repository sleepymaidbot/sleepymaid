/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Listener } from 'discord-akairo';
import { checkUserRole, performRole } from '../functions/rolesyncer';

export default class RoleListener extends Listener {
	constructor() {
		super('guildMemberUpdate', {
			emitter: 'client',
			event: 'guildMemberUpdate'
		});
  };

  async exec(oldMember, newMember) {
    let oldMemberRole: string[] = [];
    let newMemberRole: string[] = [];
    oldMember.roles.cache.forEach(role => {
      oldMemberRole.push(role.name);
    });
    newMember.roles.cache.forEach(role => {
      newMemberRole.push(role.name);
    });
    const role = newMember.guild.roles.cache.find(role => role.name === 'Colorful');
    const member = newMember

    if (oldMemberRole.length != newMemberRole.length) {
      const response = checkUserRole(oldMemberRole, newMemberRole);
      performRole(response, role, member);
    };
  };
};

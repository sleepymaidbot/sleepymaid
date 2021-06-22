/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Listener } from 'discord-akairo';
import { checkUserRole } from '../functions/rolesyncer';

export default class RoleListener extends Listener {
	constructor() {
		super('guildMemberUpdate', {
			emitter: 'client',
			event: 'guildMemberUpdate'
		});
	}

  exec(oldMember, newMember) {
    console.log('test');
    if (oldMember.roles != newMember.roles) {
      console.log('test cool');
      //checkUserRole(oldMember, newMember)
    };
  };
};

/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Listener } from 'discord-akairo';
import { checkUserRole, performRole } from '../functions/rolesyncer';

const compareArrays = (a, b) => a.length === b.length && a.every((value, index) => value === b[index]);

export default class RoleListener extends Listener {
	constructor() {
		super('guildMemberUpdate', {
			emitter: 'client',
			event: 'guildMemberUpdate'
		});
	}

	async exec(oldMember, newMember) {
		let oldMemberRole: string[] = [];
		let newMemberRole: string[] = [];
		oldMember.roles.cache.forEach((role) => {
			oldMemberRole.push(role.name);
		});
		newMember.roles.cache.forEach((role) => {
			newMemberRole.push(role.name);
		});
		const role = newMember.guild.roles.cache.find(
			(role) => role.name === 'Colorful'
		);
		const member = newMember;

		if (compareArrays(oldMemberRole, newMemberRole) == false) {
			const response = checkUserRole(oldMemberRole, newMemberRole);
			performRole(response, role, member);
		}
	}
}

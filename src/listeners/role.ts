/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Listener } from 'discord-akairo'
import { checkUserRole, performRole } from '../functions/rolesyncer'

export default class RoleListener extends Listener {
	constructor() {
		super('guildMemberUpdate', {
			emitter: 'client',
			event: 'guildMemberUpdate'
		})
	}

	async exec(oldMember, newMember) {
		const oldMemberRole = oldMember.roles.cache.map(r => r.name)
		const newMemberRole = newMember.roles.cache.map(r => r.name)
		const role = newMember.guild.roles.cache.find(
			(role) => role.name === 'Colorful'
		)

		if (oldMember.roles.cache.size != newMember.roles.cache.size) {
			const response = checkUserRole(oldMemberRole, newMemberRole)
			performRole(response, role, newMember)
		}
	}
}

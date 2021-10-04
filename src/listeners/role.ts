import { checkUserRole, performRole } from '../functions/rolesyncer'

module.exports = {
	name: 'guildMemberUpdate',
	once: false,

	async execute(oldMember, newMember) {
		const oldMemberRole = oldMember.roles.cache.map((r) => r.id)
		const newMemberRole = newMember.roles.cache.map((r) => r.id)
		const role = newMember.guild.roles.cache.find(
			(role) => role.id === '857324294791364639'
		)

		if (oldMember.roles.cache.size != newMember.roles.cache.size) {
			const response = checkUserRole(oldMemberRole, newMemberRole)
			performRole(response, role, newMember)
		}
	}
}

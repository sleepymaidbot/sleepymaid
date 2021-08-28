import { checkUserRole, performRole } from '../functions/rolesyncer'

module.exports = {
	name: 'guildMemberUpdate',
	once: false,

	async execute(oldMember, newMember) {
		const oldMemberRole = oldMember.roles.cache.map((r) => r.name)
		const newMemberRole = newMember.roles.cache.map((r) => r.name)
		const role = newMember.guild.roles.cache.find(
			(role) => role.name === 'Colorful'
		)

		if (oldMember.roles.cache.size != newMember.roles.cache.size) {
			const response = checkUserRole(oldMemberRole, newMemberRole)
			performRole(response, role, newMember)
		}
	}
}

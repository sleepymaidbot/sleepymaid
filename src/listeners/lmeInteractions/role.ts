import { checkUserRole, performRole } from '../functions/rolesyncer'

module.exports = {
	name: 'guildMemberUpdate',
	once: false,

	async execute(oldMember, newMember) {
		const oldMemberRole = await oldMember.roles.cache.map((r) => r.id)
		const newMemberRole = await newMember.roles.cache.map((r) => r.id)
		const role = newMember.guild.roles.cache.find(
			(role) => role.id === '857324294791364639'
		)

		if (oldMember.roles.cache.size != newMember.roles.cache.size) {
			const response = await checkUserRole(oldMemberRole, newMemberRole)
			await performRole(response, role, newMember)
		}
	}
}

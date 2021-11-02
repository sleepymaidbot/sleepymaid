import { GuildMember } from 'discord.js'

export async function getCRoleEligibility(
	member: GuildMember,
	userPoints: number
) {
	const userrole = member.roles.cache.map((x) => x.id)
	return userPoints >= 250 || userrole.includes('869637334126170112')
}

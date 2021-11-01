import { GuildMember } from 'discord.js'
import { mondecorteModel } from '../lib/utils/db'

export async function getUserCustomRoleId(member: GuildMember) {
	const inDb = await mondecorteModel.findOne({ id: member.id })
	return inDb?.crole
}

export async function getCRoleEligibility(
	member: GuildMember,
	userPoints: number
) {
	const userrole = member.roles.cache.map((x) => x.id)
	return userPoints >= 250 || userrole.includes('869637334126170112')
}

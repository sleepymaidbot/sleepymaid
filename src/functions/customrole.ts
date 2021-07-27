import { GuildMember } from 'discord.js'
import { customRoleModel } from '../lib/utils/db'

export async function getUserCustomRoleId(member: GuildMember) {
	const inDb = await customRoleModel.findOne({ id: member.id })
	if (inDb) {
		return inDb.role
	} else {
		return null
	}
}

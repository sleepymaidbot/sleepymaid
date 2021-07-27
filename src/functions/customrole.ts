import { GuildMember } from 'discord.js'
import { customRoleModel } from '../lib/utils/db'

export async function getUserCustomRoleId(user: GuildMember) {
	const inDb = await customRoleModel.findOne({ id: user.id })
	if (inDb) {
		return inDb.role
	} else {
		return null
	}
}

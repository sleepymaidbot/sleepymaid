import { GuildMember } from 'discord.js'
import { mondecorteModel } from '../lib/utils/db'

export async function checkUserActivityPoints(user: GuildMember) {
	const userInDb = await mondecorteModel.findOne({ id: user.id })
	return userInDb?.points || 0
}

import { GuildMember, Guild } from 'discord.js'
import { config } from '../config/config'
import { BotClient } from '../lib/extensions/BotClient'
import { mondecorteModel } from '../lib/utils/db'

export async function checkUserActivityPoints(user: GuildMember) {
	const userInDb = await mondecorteModel.findOne({ id: user.id })
	return userInDb?.points || 0
}

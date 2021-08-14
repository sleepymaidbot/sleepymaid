import { GuildMember, Guild } from 'discord.js'
import { config } from '../config/config'
import { userActivityModel } from '../lib/utils/db'

export async function checkActifRole(
	member: GuildMember,
	guild: Guild,
	points: number
) {
	const userRole: string[] = []
	member.roles.cache.forEach((role) => {
		userRole.push(role.name)
	})

	if (member.id === guild.ownerId) return;

	if (points >= 100) {
		if (!userRole.includes('Actif')) {
			const actifRole = guild.roles.cache.find((role) => role.name === 'Actif')
			console.log(config.isProduction)
			if (config.isProduction) {
				await member.roles.add(actifRole)
			} else if (config.isDevelopment) {
				console.log(
					`${member.user.tag} (${member.id}) got actif role but not added because bot is in dev env`
				)
			}
		}
	}

	if (points <= 50) {
		if (userRole.includes('Actif')) {
			const actifRole = guild.roles.cache.find((role) => role.name === 'Actif')
			if (config.isProduction) {
				await member.roles.remove(actifRole)
			} else if (config.isDevelopment) {
				console.log(
					`${member.user.tag} (${member.id}) got remove actif role but not remove because bot is in dev env`
				)
			}
		}
	}
}

export async function checkUserActivityPoints(user: GuildMember) {
	const userInDb = await userActivityModel.findOne({ id: user.id })
	if (userInDb == null) {
		return 0
	} else {
		return userInDb.points
	}
}

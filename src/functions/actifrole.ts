import { GuildMember, Guild } from 'discord.js'
import { actifRoleName } from '../config/lists'
import { config } from '../config/config'

export async function checkActifRole(
	member: GuildMember,
	guild: Guild,
	points: number
) {
	const userRole: string[] = []
	member.roles.cache.forEach((role) => {
		userRole.push(role.name)
	})

	if (points >= 100) {
		if (!userRole.includes(actifRoleName)) {
			const actifRole = guild.roles.cache.find(
				(role) => role.name === actifRoleName
			)
			if (config.isProduction) {
				await member.roles.add(actifRole)
			} else if (config.isDevelopment){
				console.log(`${member.user.tag} (${member.id}) got actif role but not added because bot is in dev env`)
			}
		}
	}

	if (points <= 50) {
		if (userRole.includes(actifRoleName)) {
			const actifRole = guild.roles.cache.find(
				(role) => role.name === actifRoleName
			)
			if (config.isProduction) {
				await member.roles.remove(actifRole)
			} else if (config.isDevelopment){
				console.log(`${member.user.tag} (${member.id}) got remove actif role but not remove because bot is in dev env`)
			}
		}
	}
}

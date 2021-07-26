import { GuildMember, Guild } from 'discord.js'
import { actifRoleName } from '../config/lists'

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
			await member.roles.add(actifRole)
		}
	}

	if (points <= 50) {
		if (userRole.includes(actifRoleName)) {
			const actifRole = guild.roles.cache.find(
				(role) => role.name === actifRoleName
			)
			await member.roles.remove(actifRole)
		}
	}
}

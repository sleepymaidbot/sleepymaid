import { GuildMember, Guild } from 'discord.js';
import { actifRole } from '../config/lists';

export function checkActifRole(
	member: GuildMember,
	guild: Guild,
	points: number
) {
	const userRole: string[] = [];
	member.roles.cache.forEach((role) => {
		userRole.push(role.name);
	});

	if (points >= 100) {
		if (!userRole.includes(actifRole)) {
			const actifRole = guild.roles.cache.find((role) => role.name === actifRole);
			member.roles.add(actifRole);
		}
	}

	if (points <= 50) {
		if (userRole.includes(actifRole)) {
			const actifRole = guild.roles.cache.find((role) => role.name === actifRole);
			member.roles.remove(actifRole);
		}
	}
}

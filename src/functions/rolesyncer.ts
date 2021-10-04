import { GuildMember, Role } from 'discord.js'
import { colorRole, ColorfulNeedRole } from '../config/lists'

export function checkUserRole(
	oldMemberRole: string[],
	newMemberRole: string[]
) {
	let wasEligibleForColorfulRole = false
	let eligibleForColorfulRole = false
	oldMemberRole.forEach((role) => {
		if (ColorfulNeedRole.includes(role.toLowerCase())) {
			wasEligibleForColorfulRole = true
		}
	})
	newMemberRole.forEach((role) => {
		if (ColorfulNeedRole.includes(role.toLowerCase())) {
			eligibleForColorfulRole = true
		}
	})

	if (wasEligibleForColorfulRole && !eligibleForColorfulRole) {
		if (newMemberRole.includes('857324294791364639')) {
			return 'remove'
		}
		return 'none'
	}
	if (!wasEligibleForColorfulRole && eligibleForColorfulRole) {
		if (newMemberRole.includes('857324294791364639')) {
			return 'none'
		}
		return 'add'
	}

	if (!wasEligibleForColorfulRole && !eligibleForColorfulRole) {
		if (newMemberRole.includes('857324294791364639')) {
			return 'remove'
		}
		return 'none'
	}

	if (wasEligibleForColorfulRole && eligibleForColorfulRole) {
		if (newMemberRole.includes('857324294791364639')) {
			return 'none'
		}
		return 'add'
	}
}

export function performRole(action: string, role: Role, member: GuildMember) {
	switch (action) {
		case 'add':
			try {
				member.roles.add(role)
				return 'Done'
			} catch (err) {
				return `Error: ${err.message}`
			}
		case 'remove':
			try {
				member.roles.remove(role)
				member.roles.cache.forEach((eachRole) => {
					if (colorRole.includes(eachRole.name)) {
						member.roles.remove(eachRole)
					}
				})
				return 'Done'
			} catch (err) {
				return `Error: ${err.message}`
			}
		default:
			return 'yes'
	}
}

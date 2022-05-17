import { GuildMember } from 'discord.js'
import { colorRole, ColorfulNeedRole } from '../../lists'
import 'reflect-metadata'
import { singleton } from 'tsyringe'
import { baseManager } from '../BaseManager'

@singleton()
export class roleSyncer extends baseManager {
	public async checkUserRole(member: GuildMember) {
		const userRole = member.roles.cache.map((r) => r.id)
		const has = {
			colorful: false
		}
		for (const role of userRole) {
			if (ColorfulNeedRole.includes(role)) {
				has.colorful = true
			}
		}
		this._performRole(has, member)
	}

	private async _performRole(has, member: GuildMember) {
		const colorfulRole = this.client.guilds.cache
			.get('324284116021542922')
			.roles.cache.get('857324294791364639')
		if (has.colorful === true) {
			if (!member.roles.cache.has('857324294791364639')) {
				await member.roles.add(colorfulRole)
			}
		} else if (has.colorful === false) {
			if (member.roles.cache.has('857324294791364639')) {
				const toRemove = []
				toRemove.push(colorfulRole.id)
				member.roles.cache.forEach(async (eachRole) => {
					if (colorRole.includes(eachRole.name)) {
						toRemove.push(eachRole.id)
					}
				})
				await member.roles.remove(toRemove)
			}
		}
	}
}

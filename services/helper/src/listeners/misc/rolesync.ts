import { ListenerInterface } from '@sleepymaid/handler'
import { GuildMember, resolveColor } from 'discord.js'

interface RoleSync {
	id: string
	pos: number
	mustHave: string[]
	toAdd: boolean
}

export default class RoleSyncerListener implements ListenerInterface {
	public readonly name = 'guildMemberUpdate'
	public readonly once = false

	public async execute(
		oldMember: GuildMember,
		newMember: GuildMember
	): Promise<void> {
		if (newMember.guild.id !== '324284116021542922') return
		if (oldMember.roles.cache.size === newMember.roles.cache.size) return
		const newRoles = newMember.roles.cache
		const guildRoles = newMember.guild.roles.cache
		let separatedRoles: RoleSync[] = []

		for await (const role of guildRoles.values()) {
			if (role.name.startsWith('─') && role.color === resolveColor('#292b2f')) {
				separatedRoles.push({
					id: role.id,
					pos: role.position,
					mustHave: [],
					toAdd: true
				})
			}
		}

		separatedRoles
			.sort((a, b) => {
				return a.pos - b.pos
			})
			.reverse()

		let max = separatedRoles.length
		for (let i = 0; i < max; i++) {
			for (const role of newRoles.values()) {
				const pos = role.position
				if (pos < separatedRoles[i]?.pos && pos > separatedRoles[i + 1]?.pos)
					separatedRoles[i].mustHave.push(role.id)
			}
		}

		const toAdd: string[] = []
		const toRemove: string[] = []

		// Remove useless separator roles
		for (let i = 0; i < max; i++) {
			if (separatedRoles[i].mustHave.length === 0) {
				toRemove.push(separatedRoles[i].id)
				separatedRoles[i] = null
			}
		}

		separatedRoles = separatedRoles.filter((role) => role !== null)

		max = separatedRoles.length
		for (let i = 0; i < max; i++) {
			const removeFirst = []
			if (i === 0) {
				for (const role of newRoles.values()) {
					if (role.position > separatedRoles[i].pos) {
						if (role.name.startsWith('─')) {
							toRemove.push(role.id)
						}
						if (role.color !== 0) removeFirst.push(true)
						else removeFirst.push(false)
					}
				}
			} else if (i >= 1) {
				for (const role of newRoles.values()) {
					if (
						role.position > separatedRoles[i].pos &&
						role.position < separatedRoles[i - 1].pos
					) {
						if (role.name.startsWith('─')) {
							toRemove.push(role.id)
						}
						if (role.color !== 0) removeFirst.push(true)
						else removeFirst.push(false)
					}
				}
			}

			if (removeFirst.every((v) => v === false)) {
				separatedRoles[i].toAdd = false
			}
		}

		for (const role of separatedRoles.values()) {
			if (role.toAdd === true) {
				toAdd.push(role.id)
			}
		}

		if (toAdd.length === 0 && toRemove.length === 0) return

		const whitelistedRoles = guildRoles
			.filter((role) => {
				return (
					role.name.startsWith('─') && role.color === resolveColor('#292b2f')
				)
			})
			.map((role) => role.id)

		toAdd.filter(
			(id) => !newMember.roles.cache.has(id) && whitelistedRoles.includes(id)
		)
		toRemove.filter(
			(id) => newMember.roles.cache.has(id) && whitelistedRoles.includes(id)
		)

		await newMember.roles.add(toAdd)
		await newMember.roles.remove(toRemove)
	}
}

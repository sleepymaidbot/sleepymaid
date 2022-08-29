import { Guild, GuildMember, resolveColor } from 'discord.js'
import { container, singleton } from 'tsyringe'
import { HelperClient } from '../../extensions/HelperClient'
import { baseManager } from '../BaseManager'

interface RoleSync {
	id: string
	pos: number
	mustHave: string[]
	toAdd: boolean
}

export const ColorfulNeedRole = [
	'797650029278920714', // Mods
	'719221506047213638', // nitro booster
	'842387653394563074', // actif
	'852884649646227476' // cute
]

const ColorfulRoleId = '857324294791364639'

@singleton()
export class ServerRoleSyncerManager extends baseManager {
	separatorRoles: RoleSync[] = []
	public async reloadSeparatorRoles(guild: Guild): Promise<void> {
		const separatedRoles: RoleSync[] = []
		for await (const role of guild.roles.cache.values()) {
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

		const max = separatedRoles.length
		for (let i = 0; i < max; i++) {
			for (const role of guild.roles.cache.values()) {
				const pos = role.position
				if (pos < separatedRoles[i]?.pos && pos > separatedRoles[i + 1]?.pos)
					separatedRoles[i].mustHave.push(role.id)
			}
		}

		this.separatorRoles.push(...separatedRoles)
	}

	public getSeparatorRoles(): RoleSync[] {
		return this.separatorRoles
	}
}

@singleton()
export class UserRoleSyncerManager extends baseManager {
	private reloadGuildSeparatorRoles(guild: Guild): void {
		container.register(HelperClient, { useValue: this.client })
		container.resolve(ServerRoleSyncerManager).reloadSeparatorRoles(guild)
	}

	public async syncRoles(member: GuildMember): Promise<void> {
		// Colorful role
		await this.checkColorfulRole(member)

		// Color roles
		await this.checkColorRoles(member)

		// Separators roles
		await this.syncSeparatorRoles(member)
	}

	private async applyRoles(
		member: GuildMember,
		toAdd: string[],
		toRemove: string[]
	): Promise<void> {
		toAdd.filter((id) => !member.roles.cache.has(id))
		toRemove.filter((id) => member.roles.cache.has(id))
		if (toAdd.length > 0) {
			await member.roles.add(toAdd)
		}
		if (toRemove.length > 0) {
			await member.roles.remove(toRemove)
		}
	}

	private async checkColorRoles(member: GuildMember): Promise<void> {
		const roles = member.roles.cache
		const separatorRoles = container
			.resolve(ServerRoleSyncerManager)
			.getSeparatorRoles()

		if (roles.has(ColorfulRoleId)) {
			return
		} else {
			if (separatorRoles.length === 0)
				this.reloadGuildSeparatorRoles(member.guild)
			const role = member.guild.roles.cache.find((role) => {
				return (
					role.name.split(' ').includes('Couleur') &&
					role.name.startsWith('─') &&
					role.color === resolveColor('#292b2f')
				)
			})

			const roles = separatorRoles.find((sep) => {
				return sep.id === role.id
			})

			console.log(roles)

			const toRemove: string[] = [...roles.mustHave]

			return await this.applyRoles(member, [], toRemove)
		}
	}

	private async checkColorfulRole(member: GuildMember): Promise<void> {
		const roles = member.roles.cache

		const toAdd: string[] = []
		const toRemove: string[] = []

		if (roles.hasAny(...ColorfulNeedRole)) {
			toAdd.push(ColorfulRoleId)
		} else {
			toRemove.push(ColorfulRoleId)
		}

		return await this.applyRoles(member, toAdd, toRemove)
	}
	private async syncSeparatorRoles(member: GuildMember): Promise<void> {
		const roles = member.roles.cache

		const separatorRoles = container
			.resolve(ServerRoleSyncerManager)
			.getSeparatorRoles()

		if (separatorRoles.length === 0)
			this.reloadGuildSeparatorRoles(member.guild)
		let userSeparator: RoleSync[] = [...separatorRoles]

		for (let i = 0; i < userSeparator.length; i++) {
			userSeparator[i].mustHave = userSeparator[i].mustHave.filter((id) =>
				roles.has(id)
			)
		}

		const toAdd: string[] = []
		const toRemove: string[] = []

		for (let i = 0; i < userSeparator.length; i++) {
			if (userSeparator[i].mustHave.length === 0) {
				toRemove.push(userSeparator[i].id)
				userSeparator[i] = null
			}
		}

		userSeparator = userSeparator.filter((role) => role !== null)

		const removeFirst = []
		for (const role of roles.values()) {
			if (role.position >= userSeparator[0].pos + 1) {
				if (role.color === 0) removeFirst.push(false)
				else removeFirst.push(true)
			}
		}

		if (removeFirst.length >= 1) {
			if (removeFirst.some((value) => value === true)) {
				userSeparator[0].toAdd = true
			} else if (removeFirst.every((value) => value === false)) {
				userSeparator[0].toAdd = false
			}
		} else if (removeFirst.length === 0) {
			userSeparator[0].toAdd = false
		}

		for (const role of userSeparator) {
			if (role.toAdd === true) {
				toAdd.push(role.id)
			} else {
				toRemove.push(role.id)
			}
		}

		return await this.applyRoles(member, toAdd, toRemove)
	}
}

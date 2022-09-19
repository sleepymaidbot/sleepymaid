// eslint is dumb af
/* eslint-disable @typescript-eslint/no-unused-vars  */
import { Collection, Guild, GuildMember, resolveColor, Role, Snowflake } from 'discord.js';
import { container, singleton } from 'tsyringe';
import { HelperClient } from '../../extensions/HelperClient';
import { baseManager } from '../BaseManager';
import { colorRoleIds } from '@sleepymaid/shared';

interface RoleSync {
	id: string;
	pos: number;
	mustHave: string[];
	toAdd: boolean;
}

export const ColorfulNeedRole = [
	'797650029278920714', // Mods
	'719221506047213638', // nitro booster
	'842387653394563074', // actif
	'852884649646227476', // cute
];

const ColorfulRoleId = '857324294791364639';

interface RoleSyncReturn {
	toAdd: string[];
	toRemove: string[];
}

@singleton()
export class ServerRoleSyncerManager extends baseManager {
	separatorRoles: RoleSync[] = [];
	public async reloadSeparatorRoles(guild: Guild): Promise<void> {
		const separatedRoles: RoleSync[] = [];
		for await (const role of guild.roles.cache.values()) {
			if (role.name.startsWith('─') && role.color === resolveColor('#292b2f')) {
				separatedRoles.push({
					id: role.id,
					pos: role.position,
					mustHave: [],
					toAdd: true,
				});
			}
		}

		separatedRoles
			.sort((a, b) => {
				return a.pos - b.pos;
			})
			.reverse();

		const max = separatedRoles.length;
		for (let i = 0; i < max; i++) {
			for (const role of guild.roles.cache.values()) {
				const pos = role.position;
				if (pos < separatedRoles[i]!.pos && pos > separatedRoles[i + 1]!.pos) separatedRoles[i]!.mustHave.push(role.id);
			}
		}

		this.separatorRoles.push(...separatedRoles);
	}

	public getSeparatorRoles(): RoleSync[] {
		return this.separatorRoles;
	}
}

const cd = new Set();

@singleton()
export class UserRoleSyncerManager extends baseManager {
	private userRole: Collection<Snowflake, Role>;
	constructor(client: HelperClient) {
		super(client);
		this.userRole = new Collection<Snowflake, Role>();
	}
	private reloadGuildSeparatorRoles(guild: Guild): void {
		container.register(HelperClient, { useValue: this.client });
		container.resolve(ServerRoleSyncerManager).reloadSeparatorRoles(guild);
	}

	public async syncRoles(member: GuildMember): Promise<void> {
		if (cd.has(member.id)) return;
		this.userRole = new Collection<Snowflake, Role>(member.roles.cache);

		const toAdd: string[] = [];
		const toRemove: string[] = [];

		// Colorful role
		const colorful = await this.checkColorfulRole();
		toAdd.push(...colorful.toAdd);
		for await (const roleId of colorful.toAdd) {
			const role = member.guild.roles.cache.get(roleId);
			if (role) {
				this.userRole.set(roleId, role);
			}
		}
		toRemove.push(...colorful.toRemove);
		for await (const roleId of colorful.toRemove) {
			this.userRole.delete(roleId);
		}

		// Color roles
		const color = await this.checkColorRoles();
		toAdd.push(...color.toAdd);
		for await (const roleId of color.toAdd) {
			const role = member.guild.roles.cache.get(roleId);
			if (role) {
				this.userRole.set(roleId, role);
			}
		}
		toRemove.push(...color.toRemove);
		for await (const roleId of color.toRemove) {
			this.userRole.delete(roleId);
		}

		// Separators roles
		/*const sep = await this.syncSeparatorRoles(member)
		toAdd.push(...sep.toAdd)
		for await (const roleId of sep.toAdd) {
			const role = member.guild.roles.cache.get(roleId)
			if (role) {
				this.userRole.set(roleId, role)
			}
		}
		toRemove.push(...sep.toRemove)
		for await (const roleId of sep.toRemove) {
			this.userRole.delete(roleId)
		}*/

		await this.applyRoles(member, toAdd, toRemove);
		if (toAdd.length > 0 || toRemove.length > 0) {
			cd.add(member.id);
			setTimeout(() => {
				cd.delete(member.id);
			}, 2000);
		}
	}

	private async applyRoles(member: GuildMember, toAdd: string[], toRemove: string[]): Promise<void> {
		toAdd.filter((id) => !member.roles.cache.has(id));
		toRemove.filter((id) => member.roles.cache.has(id));
		if (toAdd.length > 0) {
			await member.roles.add(toAdd);
		}
		if (toRemove.length > 0) {
			await member.roles.remove(toRemove);
		}
	}

	private async checkColorRoles(): Promise<RoleSyncReturn> {
		if (this.userRole.has(ColorfulRoleId)) {
			return { toAdd: [], toRemove: [] };
		} else {
			const toRemove = [...colorRoleIds];

			toRemove.filter((id) => this.userRole.has(id));

			return { toAdd: [], toRemove };
		}
	}

	private async checkColorfulRole(): Promise<RoleSyncReturn> {
		const toAdd: string[] = [];
		const toRemove: string[] = [];

		let need = false;

		for (const role of this.userRole.keys()) {
			if (ColorfulNeedRole.includes(role)) {
				need = true;
				break;
			}
		}

		if (need) {
			toAdd.push(ColorfulRoleId);
		} else {
			toRemove.push(ColorfulRoleId);
		}

		return { toAdd, toRemove };
	}
	private async syncSeparatorRoles(member: GuildMember): Promise<RoleSyncReturn> {
		const separatorRoles = container.resolve(ServerRoleSyncerManager).getSeparatorRoles();

		if (separatorRoles.length === 0) this.reloadGuildSeparatorRoles(member.guild);
		let userSeparator: Array<RoleSync | null> = [...separatorRoles];

		for (let i = 0; i < userSeparator.length; i++) {
			userSeparator[i]!.mustHave = userSeparator[i]!.mustHave.filter((id) => this.userRole.has(id));
		}

		const toAdd: string[] = [];
		const toRemove: string[] = [];

		for (let i = 0; i < userSeparator.length; i++) {
			if (userSeparator[i]!.mustHave.length === 0) {
				toRemove.push(userSeparator[i]!.id);
				userSeparator[i] = null;
			}
		}

		userSeparator = userSeparator.filter((role) => role !== null);

		const removeFirst = [];
		for (const role of this.userRole.values()) {
			if (role.position >= userSeparator[0]!.pos + 1) {
				if (role.color === 0) removeFirst.push(false);
				else removeFirst.push(true);
			}
		}

		if (removeFirst.length >= 1) {
			if (removeFirst.some((value) => value === true)) {
				userSeparator[0]!.toAdd = true;
			} else if (removeFirst.every((value) => value === false)) {
				userSeparator[0]!.toAdd = false;
			}
		} else if (removeFirst.length === 0) {
			userSeparator[0]!.toAdd = false;
		}

		for (const role of userSeparator) {
			if (role!.toAdd === true) {
				toAdd.push(role!.id);
			} else {
				toRemove.push(role!.id);
			}
		}

		return { toAdd, toRemove };
	}
}

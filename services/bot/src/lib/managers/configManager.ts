import { Snowflake } from 'discord.js'
import { singleton } from 'tsyringe'
import { BaseManager } from './baseManager'

export enum SpecialRoleType {
	'admin',
	'mod'
}

@singleton()
export class configManager extends BaseManager {
	public async getConfig(guildId: Snowflake) {
		const config = await this.client.prisma.guilds_settings.findUnique({
			where: {
				guild_id: guildId
			}
		})
		if (!config) {
			await this.client.prisma.guilds_settings.create({
				data: {
					guild_id: guildId
				}
			})
			return this.getConfig(guildId)
		}
		return config
	}

	public async addSpecialRole(
		guild_id: Snowflake,
		role_id: Snowflake,
		type: SpecialRoleType
	) {
		if (type === SpecialRoleType.admin) {
			return this.client.prisma.guilds_settings.update({
				where: {
					guild_id
				},
				data: {
					admin_roles: {
						create: {
							role_id: role_id
						}
					}
				}
			})
		} else if (type === SpecialRoleType.mod) {
			return this.client.prisma.guilds_settings.update({
				where: {
					guild_id
				},
				data: {
					mod_roles: {
						create: {
							role_id
						}
					}
				}
			})
		}
	}

	public async removeSpecialRole(
		guild_id: Snowflake,
		role_id: Snowflake,
		type: SpecialRoleType
	) {
		if (type === SpecialRoleType.admin) {
			return this.client.prisma.guilds_settings.update({
				where: {
					guild_id
				},
				data: {
					admin_roles: {
						delete: {
							role_id: role_id
						}
					}
				}
			})
		} else if (type === SpecialRoleType.mod) {
			return this.client.prisma.guilds_settings.update({
				where: {
					guild_id
				},
				data: {
					mod_roles: {
						delete: {
							role_id
						}
					}
				}
			})
		}
	}

	public async getSpecialRoles(guild_id: Snowflake, type: SpecialRoleType) {
		if (type === SpecialRoleType.admin) {
			return this.client.prisma.guilds_settings.findMany({
				where: {
					guild_id
				},
				select: {
					admin_roles: true
				}
			})
		} else if (type === SpecialRoleType.mod) {
			return this.client.prisma.guilds_settings.findMany({
				where: {
					guild_id
				},
				select: {
					mod_roles: true
				}
			})
		}
	}
}

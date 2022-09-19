import 'reflect-metadata';
import type { Snowflake } from 'discord.js';
import { singleton } from 'tsyringe';
import { baseManager } from '../BaseManager';
import type { GuildsSettings } from '@prisma/client';

export enum SpecialRoleType {
	'admin',
	'mod',
}

@singleton()
export class configManager extends baseManager {
	public async getConfig(guildId: Snowflake): Promise<GuildsSettings> {
		const config = await this.client.prisma.guildsSettings.findUnique({
			where: {
				guildId,
			},
		});
		if (!config) {
			await this.client.prisma.guildsSettings.create({
				data: {
					guildId,
				},
			});
			return this.getConfig(guildId);
		}
		return config;
	}

	public async addSpecialRole(guildId: Snowflake, roleId: Snowflake, type: SpecialRoleType) {
		if (type === SpecialRoleType.admin) {
			return this.client.prisma.guildsSettings.update({
				where: {
					guildId,
				},
				data: {
					adminRoles: {
						create: {
							roleId,
						},
					},
				},
			});
		} else if (type === SpecialRoleType.mod) {
			return this.client.prisma.guildsSettings.update({
				where: {
					guildId,
				},
				data: {
					modRoles: {
						create: {
							roleId,
						},
					},
				},
			});
		}
	}

	public async removeSpecialRole(guildId: Snowflake, roleId: Snowflake, type: SpecialRoleType) {
		if (type === SpecialRoleType.admin) {
			return this.client.prisma.guildsSettings.update({
				where: {
					guildId,
				},
				data: {
					adminRoles: {
						delete: {
							roleId,
						},
					},
				},
			});
		} else if (type === SpecialRoleType.mod) {
			return this.client.prisma.guildsSettings.update({
				where: {
					guildId,
				},
				data: {
					modRoles: {
						delete: {
							roleId,
						},
					},
				},
			});
		}
	}

	public async getSpecialRoles(guildId: Snowflake) {
		return this.client.prisma.guildsSettings.findMany({
			where: {
				guildId,
			},
			select: {
				modRoles: true,
				adminRoles: true,
			},
		});
	}
}

import 'reflect-metadata';
import type { Snowflake } from 'discord.js';
import { singleton } from 'tsyringe';
import { baseManager } from '../BaseManager';
import { guildsSettings } from '@sleepymaid/db';
import { eq } from 'drizzle-orm';

export enum SpecialRoleType {
	'admin',
	'mod',
}

@singleton()
export class configManager extends baseManager {
	public async getConfig(guildId: Snowflake): Promise<{
		guildId: string;
		sanitizerEnabled: boolean;
		sanitizerIgnoredRoles: string[] | null;
		adminRoles: string[] | null;
		modRoles: string[] | null;
	}> {
		const config = (
			await this.client.drizzle.select().from(guildsSettings).where(eq(guildsSettings.guildId, guildId))
		)[0]!;
		if (!config) {
			await this.client.drizzle.insert(guildsSettings).values({ guildId });
			return this.getConfig(guildId);
		}
		return config;
	}

	public async addSpecialRole(guildId: Snowflake, roleId: Snowflake, type: SpecialRoleType) {
		const guildSettings = (
			await this.client.drizzle.select().from(guildsSettings).where(eq(guildsSettings.guildId, guildId))
		)[0]!;
		if (type === SpecialRoleType.admin) {
			return this.client.drizzle
				.update(guildsSettings)
				.set({ adminRoles: [...guildSettings.adminRoles!, roleId] })
				.where(eq(guildsSettings.guildId, guildId));
		} else if (type === SpecialRoleType.mod) {
			return this.client.drizzle
				.update(guildsSettings)
				.set({ modRoles: [...guildSettings.modRoles!, roleId] })
				.where(eq(guildsSettings.guildId, guildId));
		} else return null;
	}

	private removeRoleFromArray(array: Snowflake[], roleId: Snowflake) {
		const index = array.indexOf(roleId);
		if (index > -1) {
			array.splice(index, 1);
		}
		return array;
	}

	public async removeSpecialRole(guildId: Snowflake, roleId: Snowflake, type: SpecialRoleType) {
		const guildSettings = (
			await this.client.drizzle.select().from(guildsSettings).where(eq(guildsSettings.guildId, guildId))
		)[0]!;
		if (type === SpecialRoleType.admin) {
			return this.client.drizzle
				.update(guildsSettings)
				.set({ adminRoles: this.removeRoleFromArray(guildSettings.adminRoles!, roleId) })
				.where(eq(guildsSettings.guildId, guildId));
		} else if (type === SpecialRoleType.mod) {
			return this.client.drizzle
				.update(guildsSettings)
				.set({ modRoles: this.removeRoleFromArray(guildSettings.modRoles!, roleId) })
				.where(eq(guildsSettings.guildId, guildId));
		} else return null;
	}

	public async getSpecialRoles(guildId: Snowflake) {
		return (await this.client.drizzle.select().from(guildsSettings).where(eq(guildsSettings.guildId, guildId)))[0]!;
	}
}

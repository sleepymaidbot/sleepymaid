import 'reflect-metadata';
import { singleton } from 'tsyringe';
import { GuildMember, resolveColor } from 'discord.js';
import { actifRoles } from '@sleepymaid/shared';
import { EmbedBuilder } from '@discordjs/builders';
import { baseManager } from '../BaseManager';
import type { mondecorte } from '@prisma/client';

@singleton()
export class ActivityRewardManager extends baseManager {
	public async checkActivityReward(member: GuildMember) {
		if (member.user.id === '324281236728053760') return;
		const inDb = await this.client.prisma.mondecorte.findUnique({
			where: { user_id: member.id },
		});
		this._checkActivityRoles(member, inDb);
		this._checkCustomRole(member, inDb);
	}

	private async _isEligibleForCustomRole(member: GuildMember, inDb: mondecorte | null) {
		return inDb!.points! >= 200 || member.roles.cache.has('869637334126170112');
	}

	private async _checkActivityRoles(member: GuildMember, inDb: mondecorte | null) {
		if (member.user.bot) return;
		if (member.user.id === '324281236728053760') return;
		const points = inDb?.points || 0;

		const addRoleObj = actifRoles.filter((roles) => roles.points <= points);
		const toAddRoles = addRoleObj.map((role) => role.roleId);
		const removeRoleObj = actifRoles.filter((roles) => roles.points - 50 >= points);
		const toRemoveRoles = removeRoleObj.map((roles) => roles.roleId);

		if (this.client.config.nodeEnv === 'prod') {
			try {
				await member.roles.add(toAddRoles);
				await member.roles.remove(toRemoveRoles);
			} catch (e) {
				this.client.logger.error(e as Error);
			}
		}
	}

	private async _checkCustomRole(member: GuildMember, inDb: mondecorte | null) {
		const cRoleId = inDb?.custom_role_id || null;

		if (cRoleId != null) {
			if ((await this._isEligibleForCustomRole(member, inDb)) === false) {
				if (this.client.config.nodeEnv === 'dev') return;
				this.client.logger.info(`Deleting ${member.user.tag} custom role`);
				const guild = this.client.guilds.cache.get('324284116021542922');
				const cRole = await guild?.roles.fetch(cRoleId);
				if (cRole !== undefined) {
					try {
						await cRole?.delete();
					} catch (err) {
						this.client.logger.error(err as Error);
					}

					await this.client.prisma.mondecorte.update({
						where: { user_id: member.id },
						data: { custom_role_id: null },
					});
					const embed = new EmbedBuilder()
						.setAuthor({
							name: `Rôle custom de ${member.user.tag}`,
							iconURL: member.user.avatarURL() || undefined,
						})
						.setColor(resolveColor('#36393f'))
						.setTimestamp()
						.setDescription(`Tu n'est plus éligible pour un rôle custom je t'ai donc retirer retirer ton rôle custom
					Voici quelques informations sur ton rôle custom:
					\`\`\`{\n	name: "${cRole?.name}",\n	color: "${cRole?.color}"\n} \`\`\``);
					try {
						await member.user.send({ embeds: [embed] });
					} catch (err) {
						this.client.logger.error(err as Error);
					}
				} else {
					await this.client.prisma.mondecorte.update({
						where: { user_id: member.id },
						data: { custom_role_id: null },
					});
				}
			}
		}
	}
}

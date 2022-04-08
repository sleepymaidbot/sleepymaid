import 'reflect-metadata'
import { singleton } from 'tsyringe'
import { BotClient } from './BotClient'
import { GuildMember, Util } from 'discord.js'
import { actifRoles } from './lists'
import { config } from '@sleepymaid/config'
import { EmbedBuilder } from '@discordjs/builders'

@singleton()
export class ActivityRewardManager {
	public declare client: BotClient
	public constructor(client: BotClient) {
		this.client = client
	}

	public async checkActivityReward(member: GuildMember) {
		const inDb = await this.client.prisma.mondecorte.findUnique({
			where: { user_id: member.id }
		})
		this._checkActivityRoles(member, inDb)
		this._checkCustomRole(member, inDb)
	}

	private async _isEligibleForCustomRole(member: GuildMember, inDb) {
		return inDb.points >= 200 || member.roles.cache.has('869637334126170112')
	}

	private async _checkActivityRoles(member: GuildMember, inDb) {
		if (member.user.bot) return
		if (member.user.id === '324281236728053760') return
		const points = inDb?.points || 0

		const addRoleObj = actifRoles.filter((roles) => roles.points <= points)
		const toAddRoles = addRoleObj.map((role) => role.roleId)
		const removeRoleObj = actifRoles.filter(
			(roles) => roles.points - 50 >= points
		)
		const toRemoveRoles = removeRoleObj.map((roles) => roles.roleId)

		if (config.isProduction) {
			try {
				await member.roles.add(toAddRoles)
				await member.roles.remove(toRemoveRoles)
			} catch (e) {
				this.client.logger.error(e)
			}
		}
	}

	private async _checkCustomRole(member: GuildMember, inDb) {
		const cRoleId = inDb?.custom_role_id || null

		if (cRoleId != null) {
			if ((await this._isEligibleForCustomRole(member, inDb)) === false) {
				if (config.isDevelopment) return
				this.client.logger.info(`Deleting ${member.user.tag} custom role`)
				const guild = this.client.guilds.cache.get('324284116021542922')
				const cRole = await guild.roles.fetch(cRoleId)
				if (cRole !== undefined) {
					try {
						await cRole.delete()
					} catch (err) {
						this.client.logger.error(err)
					}

					await this.client.prisma.mondecorte.update({
						where: { user_id: member.id },
						data: { custom_role_id: null }
					})
					const embed = new EmbedBuilder()
						.setAuthor({
							name: `Rôle custom de ${member.user.tag}`,
							iconURL: member.user.avatarURL()
						})
						.setColor(Util.resolveColor('#36393f'))
						.setTimestamp()
						.setDescription(`Tu n'est plus éligible pour un rôle custom je t'ai donc retirer retirer ton rôle custom
					Voici quelques informations sur ton rôle custom:
					\`\`\`{\n	name: "${cRole.name}",\n	color: "${cRole.color}"\n} \`\`\``)
					try {
						await member.user.send({ embeds: [embed] })
					} catch (err) {
						this.client.logger.error(err)
					}
				} else {
					await this.client.prisma.mondecorte.update({
						where: { user_id: member.id },
						data: { custom_role_id: null }
					})
				}
			}
		}
	}
}

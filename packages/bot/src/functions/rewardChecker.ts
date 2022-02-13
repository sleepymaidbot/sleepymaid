import { Guild, GuildMember, Util } from 'discord.js'
import { Embed } from '@discordjs/builders'
import { BotClient } from '../lib/extensions/BotClient'
import { config } from '../config/config'
import { actifRoles } from '../config/lists'

async function getCRoleEligibility(
	userPoints: number,
	userRole: Array<string>
) {
	return userPoints >= 200 || userRole.includes('869637334126170112')
}

export async function rewardChecker(
	member: GuildMember,
	guild: Guild,
	client: BotClient
) {
	if (member.user.bot) return
	if (member.user.id === '324281236728053760') return
	const inDb = await client.prisma.mondecorte.findUnique({
		where: { user_id: member.id }
	})
	const points = inDb?.points || 0
	const userRole = member.roles.cache.map((role) => role.id)

	const addRoleObj = actifRoles.filter((roles) => roles.points <= points)
	const toAddRoles = []
	for (const role of addRoleObj) {
		toAddRoles.push(role.roleId)
	}
	const removeRoleObj = actifRoles.filter(
		(roles) => roles.points - 50 >= points
	)
	const toRemoveRoles = []
	for (const role of removeRoleObj) {
		toRemoveRoles.push(role.roleId)
	}

	if (config.isProduction) {
		try {
			member.roles.add(toAddRoles)
			member.roles.remove(toRemoveRoles)
		} catch (e) {
			client.logger.error(e)
		}
	}

	// Check custom role

	const cRoleId = inDb?.custom_role_id || null

	if (cRoleId != null) {
		if ((await getCRoleEligibility(points, userRole)) === false) {
			if (config.isDevelopment) return
			client.logger.info(`Deleting ${member.user.tag} custom role`)
			const cRole = await guild.roles.fetch(cRoleId)
			if (cRole !== undefined) {
				try {
					await cRole.delete()
				} catch (err) {
					client.logger.error(err)
				}

				await client.prisma.mondecorte.update({
					where: { user_id: member.id },
					data: { custom_role_id: null }
				})
				const embed = new Embed()
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
					client.logger.error(err)
				}
			} else {
				await client.prisma.mondecorte.update({
					where: { user_id: member.id },
					data: { custom_role_id: null }
				})
			}
		}
	}
}

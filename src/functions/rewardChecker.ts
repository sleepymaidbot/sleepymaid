import { Guild, GuildMember, MessageEmbed } from 'discord.js'
import { BotClient } from '../lib/extensions/BotClient'
import { mondecorteModel } from '../lib/utils/db'
import { config } from '../config/config'
import { actifRoles } from '../config/lists'

function neededRole(userPoints: number) {
	const roleObj = actifRoles.filter((roles) => roles.points <= userPoints)
	const roles = []
	for (const role of roleObj) {
		roles.push(role.roleId)
	}
	return roles
}

function notNeededRole(userPoints: number) {
	const roleObj = actifRoles.filter((roles) => roles.points - 50 >= userPoints)
	const roles = []
	for (const role of roleObj) {
		roles.push(role.roleId)
	}
	return roles
}

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
	const inDb = await mondecorteModel.findOne({ id: member.id })
	const points = inDb?.points || 0

	// Check actif roles

	const neededRoles = neededRole(points)
	const notNeededRoles = notNeededRole(points)
	const userRole = member.roles.cache.map((role) => role.id)
	const actifRoleList = []
	for (const role of actifRoles) {
		actifRoleList.push(role.roleId)
	}
	const toAdd = neededRoles.filter((role) => !userRole.includes(role))
	const toRemove = actifRoleList.filter(
		(role) => notNeededRoles.includes(role) && userRole.includes(role)
	)

	if (config.isProduction) {
		try {
			member.roles.remove(toRemove)
			member.roles.add(toAdd)
		} catch (e) {
			client.logger.error(e)
		}
	}

	// Check custom role

	const cRoleId = inDb?.crole || null

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

				const inDb = await mondecorteModel.findOne({ id: member.id })
				inDb.crole = null
				await inDb.save()
				const embed = new MessageEmbed()
					.setAuthor({
						name: `Rôle custom de ${member.user.tag}`,
						iconURL: member.user.avatarURL()
					})
					.setColor('#36393f')
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
				inDb.crole = null
				await inDb.save()
			}
		}
	}
}

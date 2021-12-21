import { Guild, GuildMember, MessageEmbed } from 'discord.js'
import { BotClient } from '../lib/extensions/BotClient'
import { mondecorteModel } from '../lib/utils/db'
import { config } from '../config/config'

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
	const inDb = await mondecorteModel.findOne({ id: member.id })
	const points = inDb?.points || 0

	if (member.user.bot) return

	// Check actif role

	const userRole = member.roles.cache.map((role) => role.id)

	if (points >= 100) {
		if (!userRole.includes('842387653394563074')) {
			const actifRole = guild.roles.cache.find(
				(role) => role.id === '842387653394563074'
			)
			if (config.isProduction) {
				await member.roles.add(actifRole)
			} else if (config.isDevelopment) {
				client.logger.debug(
					`${member.user.tag} (${member.id}) got actif role but not added because bot is in dev env`
				)
			}
		}
	}

	if (points <= 50) {
		if (userRole.includes('842387653394563074')) {
			const actifRole = guild.roles.cache.find(
				(role) => role.id === '842387653394563074'
			)
			if (config.isProduction) {
				await member.roles.remove(actifRole)
			} else if (config.isDevelopment) {
				client.logger.debug(
					`${member.user.tag} (${member.id}) got remove actif role but not remove because bot is in dev env`
				)
			}
		}
	}

	// Check custom role

	const cRoleId = inDb?.crole || null

	if (cRoleId != null) {
		if ((await getCRoleEligibility(points, userRole)) === false) {
			if (config.isDevelopment) return
			const cRole = await guild.roles.fetch(cRoleId)
			await cRole.delete()
			const inDb = await mondecorteModel.findOne({ id: member.id })
			inDb.crole = null
			await inDb.save()
			try {
				const embed = new MessageEmbed()
				.setAuthor(`Rôle custom de ${member.user.tag}`, member.user.avatarURL())
				.setColor('#36393f')
				.setTimestamp()
				.setDescription(`Tu n'est plus éligible pour un rôle custom je t'ai donc retirer retirer ton rôle custom
				Voici quelques informations sur ton rôle custom:
				\`\`\`{\n	name: "${cRole.name}",\n	color: "${cRole.color}"\n} \`\`\``)
				await member.user.send({ embeds: [embed] })
			} catch (error) {
				client.logger.error(error)
			}
		}
	}
}

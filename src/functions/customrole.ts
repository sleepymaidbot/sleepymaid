import { Guild, GuildMember, MessageEmbed } from 'discord.js'
import { mondecorteModel } from '../lib/utils/db'
import { checkUserActivityPoints } from './actifrole'

export async function getUserCustomRoleId(member: GuildMember) {
	const inDb = await mondecorteModel.findOne({ id: member.id })
	if (inDb) {
		return inDb.crole
	} else {
		return null
	}
}

export async function getcrole(member: GuildMember) {
	const userPoints = await checkUserActivityPoints(member)

	const userrole = member.roles.cache.map(x => x.id)

	if (userPoints >= 250 || userrole.includes('869637334126170112')) {
		return true
	} else {
		return false
	}
}

export async function checkCustomRole(
	member: GuildMember,
	guild: Guild,
	points: number
) {
	if (points < 250) {
		const croleId = await getUserCustomRoleId(member)
		const crole = guild.roles.cache.find((role) => role.id === croleId)
		if (member.roles.cache.has(croleId)) {
			const embed = new MessageEmbed()
				.setAuthor(`Rôle custom de ${member.user.tag}`, member.user.avatarURL())
				.setColor('#36393f')
				.setTimestamp()
				.setDescription(`Tu n'est plus éligible pour un rôle custom je t'ai donc retirer retirer ton rôle custom
				Voici quelques informations sur ton rôle custom:
				\`\`\`{\n	name: "${crole.name}",\n	color: "${crole.color}"\n} \`\`\``)

			await crole.delete()
			const inDb = await mondecorteModel.findOne({ id: member.id })
			inDb.crole = null
			await inDb.save()
			await member.user.send({ embeds: [embed] })
		}
	}
}

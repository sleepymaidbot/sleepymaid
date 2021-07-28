import { Guild, GuildMember, MessageEmbed } from 'discord.js'
import { customRoleModel } from '../lib/utils/db'

export async function getUserCustomRoleId(member: GuildMember) {
	const inDb = await customRoleModel.findOne({ id: member.id })
	if (inDb) {
		return inDb.role
	} else {
		return null
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
			await customRoleModel
				.deleteOne({ id: member.id })
				.catch(console.error)
			await member.user.send({ embeds: [embed]})
			
		}
	}
}

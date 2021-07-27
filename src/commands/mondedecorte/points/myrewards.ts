import { Message, MessageEmbed } from 'discord.js'
import { checkUserActivityPoints } from '../../../functions/actifrole'
import { BotCommand } from '../../../lib/extensions/BotCommand'
import { getUserCustomRoleId } from '../../../functions/customrole'
import { config } from '../../../config/config'

export default class MyRewards extends BotCommand {
	constructor() {
		super('MyRewards', {
			aliases: ['myrewards', 'rewards', 'mr'],
			description: 'Show your rewards.',
			channel: 'guild'
		})
	}

	async exec(message: Message) {
		if (message.guild.id != '324284116021542922') return
		const userInDb = await checkUserActivityPoints(message.member)
		const embed = new MessageEmbed()
			.setColor('#36393f')
			.setAuthor(`${message.author.tag} rewards`, message.author.avatarURL())
			.setTimestamp()

		let hasActifRole = '❌'
		const arole = message.guild.roles.cache.find(
			(role) => role.name === 'Actif'
		)
		if (message.member.roles.cache.has(arole.id)) {
			hasActifRole = '✅'
		}
		let hasCustomRole = '❌'
		const croleid = await getUserCustomRoleId(message.member)
		if (userInDb >= 250) {
			if (croleid != null) {
				if (message.member.roles.cache.has(croleid)) {
					hasCustomRole = '✅'
				} else {
					const crole = message.guild.roles.cache.find(
						(role) => role.id === croleid
					)
					message.member.roles.add(crole).catch(console.error)
				}
			} else {
				hasCustomRole = '🟡'
				embed.addField(
					'Une récompense non réclamer',
					`\`\`\`Tu n'a pas réclamer ton rôle custom. Pour le réclamer fait "${config.prefix}customrole create <nom>" <nom> étant le nom désiré du rôle.\`\`\``,
					true
				)
			}
		}
		let hasColorful = '❌'
		const corole = message.guild.roles.cache.find(
			(role) => role.name === 'Colorful'
		)
		if (message.member.roles.cache.has(corole.id)) {
			hasColorful = '✅'
		}

		embed.setDescription(`Voici une liste des récompense que tu a obtenu:
		- Rôle <@&857324294791364639>: ${hasColorful}
         - Rôle <@&842387653394563074>: ${hasActifRole}
         - Rôle <@&869637334126170112>: ${hasCustomRole}`)

		await message.reply({ embeds: [embed] })
	}
}

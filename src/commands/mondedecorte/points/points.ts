import { BotCommand } from '../../../lib/extensions/BotCommand'
import { userActivityModel } from '../../../lib/utils/db'
import { MessageEmbed } from 'discord.js'
import { checkUserActivityPoints } from '../../../functions/actifrole'

export default class pointsCommand extends BotCommand {
	constructor() {
		super('points', {
			aliases: ['points', 'mypoints'],
			ownerOnly: true,
			channel: 'guild',
			args: [
				{
					id: 'member',
					type: 'member',
					default: (message) => message.member
				}
			]
		})
	}

	async exec(message, args) {
		if (message.guild.id != '324284116021542922') return
		const userInDB = await checkUserActivityPoints(args.member)
		if (userInDB == 0) {
			const embed = new MessageEmbed()
				.setColor('#36393f')
				.setAuthor(message.author.tag, message.author.avatarURL())
				.setDescription(
					`<@${args.member.id}> n'a pas de points. \nCommence pas envoyer des message pour en avoir.`
				)
				.setTimestamp()
			message.reply({ embeds: [embed] })
		} else {
			if (userInDB == 1) {
				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor(message.author.tag, message.author.avatarURL())
					.setDescription(`<@${args.member.id}> a ${userInDB} point.`)
					.setTimestamp()
				message.reply({ embeds: [embed] })
			} else {
				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor(message.author.tag, message.author.avatarURL())
					.setDescription(`<@${args.member.id}> a ${userInDB} points.`)
					.setTimestamp()
				message.reply({ embeds: [embed] })
			}
		}
	}
}

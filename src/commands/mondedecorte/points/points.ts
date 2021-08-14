import { BotCommand } from '../../../lib/extensions/BotCommand'
import { MessageEmbed } from 'discord.js'
import { checkUserActivityPoints } from '../../../functions/actifrole'
import { slashGuildsIds } from '../../../config/lists'

export default class pointsCommand extends BotCommand {
	constructor() {
		super('points', {
			aliases: ['points', 'mypoints'],
			channel: 'guild',
			description: 'Show your or someone points. ',
			slash: true,
			slashGuilds: slashGuildsIds,
			slashOptions: [
				{
					name: 'member',
					description: 'The member you want to check points',
					type: 'USER',
					required: false
				}
			],
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

		if (
			message.member.roles.cache.has('842387653394563074') ||
			message.member.id == '324281236728053760'
		) {
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

	async execSlash(message, args) {
		let member
		if (!args.member) {
			member = message.author
		} else {
			member = message.guild.members.cache.get(args.member)
		}
		if (message.guild.id != '324284116021542922') return

		if (
			message.member.roles.cache.has('842387653394563074') ||
			message.member.id == '324281236728053760'
		) {
			const userInDB = await checkUserActivityPoints(member)
			if (userInDB == 0) {
				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor(message.author.tag, message.author.avatarURL())
					.setDescription(
						`<@${member.id}> n'a pas de points. \nCommence pas envoyer des message pour en avoir.`
					)
					.setTimestamp()
				message.reply({ embeds: [embed] })
			} else {
				if (userInDB == 1) {
					const embed = new MessageEmbed()
						.setColor('#36393f')
						.setAuthor(message.author.tag, message.author.avatarURL())
						.setDescription(`<@${member.id}> a ${userInDB} point.`)
						.setTimestamp()
					message.reply({ embeds: [embed] })
				} else {
					const embed = new MessageEmbed()
						.setColor('#36393f')
						.setAuthor(message.author.tag, message.author.avatarURL())
						.setDescription(`<@${member.id}> a ${userInDB} points.`)
						.setTimestamp()
					message.reply({ embeds: [embed] })
				}
			}
		} else {
			message.reply({
				content: 'Tu doit avoir le rôle actif pour utliser cette commande',
				ephemeral: true
			})
		}
	}
}

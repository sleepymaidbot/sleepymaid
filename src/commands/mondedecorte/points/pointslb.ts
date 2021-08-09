import { BotCommand } from '../../../lib/extensions/BotCommand'
import { Message, MessageEmbed } from 'discord.js'
import { userActivityModel } from '../../../lib/utils/db'
import { slashGuildsIds } from '../../../config/lists'

interface User {
	id: string
	points: number
}

export default class pointsLeaderboardCommand extends BotCommand {
	constructor() {
		super('pointsLb', {
			aliases: ['pointslb', 'pointsleaderboard'],
			channel: 'guild',
			description: 'Show the guild points leaderboard.',
			slash: true,
			slashGuilds: slashGuildsIds
		})
	}

	async exec(message: Message) {
		if (message.guild.id != '324284116021542922') return

		if (
			message.member.roles.cache.has('842387653394563074') ||
			message.member.id == '324284116021542922'
		) {
			let allPoints: Array<User>
			userActivityModel.find({}).then((docs) => {
				allPoints = docs

				allPoints.sort((a, b) => {
					return a.points - b.points
				})

				const coolList: Array<string> = []

				allPoints.reverse().forEach((user) => {
					if (user.points == 0) {
						return
					} else {
						coolList.push(`<@${user.id}>: ${user.points} points`)
					}
				})

				const leaderboardText = `:first_place: ${coolList[0]}
				:second_place: ${coolList[1]}
				:third_place: ${coolList[2]}
				:four: ${coolList[3]}
				:five: ${coolList[4]}
				:six: ${coolList[5]}
				:seven: ${coolList[6]}
				:eight: ${coolList[7]}
				:nine: ${coolList[8]}
				:keycap_ten: ${coolList[9]}`

				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor('Leaderboard du serveur', message.guild.iconURL())
					.setDescription(leaderboardText)
					.setTimestamp()
				return message.reply({ embeds: [embed] })
			})
		} else {
			message.reply({
				content: 'Tu doit avoir le rôle acitf pour utliser cette commande'
			})
		}
	}

	async execSlash(message) {
		if (message.guild.id != '324284116021542922') return

		if (
			message.member.roles.cache.has('842387653394563074') ||
			message.member.id == '324284116021542922'
		) {
			let allPoints: Array<User>
			userActivityModel.find({}).then((docs) => {
				allPoints = docs

				allPoints.sort((a, b) => {
					return a.points - b.points
				})

				const coolList: Array<string> = []

				allPoints.reverse().forEach((user) => {
					if (user.points == 0) {
						return
					} else {
						coolList.push(`<@${user.id}>: ${user.points} points`)
					}
				})

				const leaderboardText = `:first_place: ${coolList[0]}
				:second_place: ${coolList[1]}
				:third_place: ${coolList[2]}
				:four: ${coolList[3]}
				:five: ${coolList[4]}
				:six: ${coolList[5]}
				:seven: ${coolList[6]}
				:eight: ${coolList[7]}
				:nine: ${coolList[8]}
				:keycap_ten: ${coolList[9]}`

				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor('Leaderboard du serveur', message.guild.iconURL())
					.setDescription(leaderboardText)
					.setTimestamp()
				return message.reply({ embeds: [embed] })
			})
		} else {
			message.reply({
				content: 'Tu doit avoir le rôle acitf pour utliser cette commande',
				ephemeral: true
			})
		}
	}
}

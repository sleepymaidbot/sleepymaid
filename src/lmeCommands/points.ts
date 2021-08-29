import { SlashCommandBuilder } from '@discordjs/builders'
import { checkUserActivityPoints } from '../functions/actifrole'
import { MessageEmbed } from 'discord.js'
import { mondecorte, mondecorteModel } from '../lib/utils/db'
import { checkUserRole, performRole } from '../functions/rolesyncer'
import { getUserCustomRoleId } from '../functions/customrole'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('points')
		.setDescription('Points command.')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('user')
				.setDescription('Show your or someone points.')
				.addUserOption((option) =>
					option.setName('user').setDescription('The user').setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('rewards').setDescription('Show my rewards.')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('leaderboard')
				.setDescription('See the server leaderboard')
		),

	async execute(interaction) {
		const subcommand = interaction.options.getSubcommand()
		switch (subcommand) {
			case 'user': {
				const user = interaction.options.get('user')
				let member
				if (user === null) {
					member = interaction.member
				} else {
					member = await interaction.guild.members.fetch(user.value)
				}

				if (
					interaction.member.roles.cache.has('842387653394563074') ||
					interaction.member.id == '324281236728053760'
				) {
					const userInDB = await checkUserActivityPoints(member)
					if (userInDB == 0) {
						const embed = new MessageEmbed()
							.setColor('#36393f')
							.setAuthor(
								interaction.member.user.tag,
								interaction.member.user.avatarURL()
							)
							.setDescription(
								`<@${member.id}> n'a pas de points. \nCommence pas envoyer des message pour en avoir.`
							)
							.setTimestamp()
						interaction.reply({ embeds: [embed] })
					} else {
						if (userInDB == 1) {
							const embed = new MessageEmbed()
								.setColor('#36393f')
								.setAuthor(
									interaction.member.user.tag,
									interaction.member.user.avatarURL()
								)
								.setDescription(`<@${member.id}> a ${userInDB} point.`)
								.setTimestamp()
							interaction.reply({ embeds: [embed] })
						} else {
							const embed = new MessageEmbed()
								.setColor('#36393f')
								.setAuthor(
									interaction.member.user.tag,
									interaction.member.user.avatarURL()
								)
								.setDescription(`<@${member.id}> a ${userInDB} points.`)
								.setTimestamp()
							interaction.reply({ embeds: [embed] })
						}
					}
				} else {
					interaction.reply({
						content: 'Tu doit avoir le rôle actif pour utliser cette commande',
						ephemeral: true
					})
				}
				break
			}
			case 'rewards': {
				const userInDb = await checkUserActivityPoints(interaction.member)
				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor(
						`${interaction.member.user.tag} rewards`,
						interaction.member.user.avatarURL()
					)
					.setTimestamp()

				let hasActifRole = '❌'
				const arole = await interaction.guild.roles.cache.find(
					(role) => role.name === 'Actif'
				)
				if (interaction.member.roles.cache.has(arole.id)) {
					hasActifRole = '✅'
				}
				let hasCustomRole = '❌'
				const croleid = await getUserCustomRoleId(interaction.member)
				if (userInDb >= 250) {
					if (croleid != null) {
						if (interaction.member.roles.cache.has(croleid)) {
							hasCustomRole = '✅'
						} else {
							const crole = interaction.guild.roles.cache.find(
								(role) => role.id === croleid
							)
							interaction.member.roles.add(crole).catch(console.error)
						}
					} else {
						hasCustomRole = '🟡'
						embed.addField(
							'Une récompense non réclamer',
							'```Tu n\'a pas réclamer ton rôle custom. \nPour le réclamer fait "/customrole create <nom>" \n<nom> étant le nom désiré du rôle.```',
							true
						)
					}
				}
				let hasColorful = '❌'
				const corole = interaction.guild.roles.cache.find(
					(role) => role.name === 'Colorful'
				)
				if (interaction.member.roles.cache.has(corole.id)) {
					hasColorful = '✅'
				}
				// eslint-disable-next-line prefer-const
				let memberRole: string[] = []
				interaction.member.roles.cache.forEach((role) => {
					memberRole.push(role.name)
				})
				const response = checkUserRole(memberRole, memberRole)
				const role = interaction.guild.roles.cache.find(
					(role) => role.name === 'Colorful'
				)
				performRole(response, role, interaction.member)

				embed.setDescription(`Voici une liste des récompense que tu a obtenu:
			- Rôle <@&857324294791364639>: ${hasColorful}
			- Rôle <@&842387653394563074>: ${hasActifRole}
			- Rôle <@&869637334126170112>: ${hasCustomRole}`)

				await interaction.reply({ embeds: [embed] })
				break
			}
			case 'leaderboard': {
				if (
					interaction.member.roles.cache.has('842387653394563074') ||
					interaction.member.id == '324281236728053760'
				) {
					let allPoints: Array<mondecorte>
					mondecorteModel.find({}).then((docs) => {
						allPoints = docs

						allPoints.sort((a, b) => {
							return a.points - b.points
						})

						const coolList: Array<string> = []

						allPoints.reverse().forEach((user) => {
							if (user.points == 0) return
							coolList.push(`<@${user.id}>: ${user.points} points`)
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
							.setAuthor('Leaderboard du serveur', interaction.guild.iconURL())
							.setDescription(leaderboardText)
							.setTimestamp()
						return interaction.reply({ embeds: [embed] })
					})
				} else {
					interaction.reply({
						content: 'Tu doit avoir le rôle actif pour utliser cette commande'
					})
				}
				break
			}
		}
	}
}

import { SlashCommandBuilder } from '@discordjs/builders'
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js'
import { mondecorteModel } from '../lib/utils/db'
import { checkUserRole, performRole } from '../functions/rolesyncer'
import { pointToRemoveForPoints } from '../config/lists'
import { rewardChecker } from '../functions/rewardChecker'

const intForEmote = {
	1: ':first_place:',
	2: ':second_place:',
	3: ':third_place:',
	4: ':four:',
	5: ':five:',
	6: ':six:',
	7: ':seven:',
	8: ':eight:',
	9: ':nine:',
	10: ':keycap_ten:'
}

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
				.addNumberOption((option) =>
					option.setName('page').setDescription('The page').setRequired(false)
				)
		),

	async execute(interaction, client) {
		switch (interaction.options.getSubcommand()) {
			case 'user': {
				await interaction.deferReply()
				const user = interaction.options.get('user')
				let member
				if (user === null) {
					member = interaction.member
				} else {
					member = await interaction.guild.members.fetch(user.value)
					await rewardChecker(member, interaction.guild, client)
				}

				if (
					interaction.member.roles.cache.has('842387653394563074') ||
					interaction.member.id == '324281236728053760'
				) {
					const userInDB = await mondecorteModel.findOne({ userID: member.id })
					const points = userInDB?.points || 0
					if (points == 0) {
						const embed = new MessageEmbed()
							.setColor('#36393f')
							.setAuthor(
								interaction.member.user.tag,
								interaction.member.user.avatarURL()
							)
							.setDescription(
								`${member} n'a pas de points. \nCommence par envoyer des message pour en avoir.`
							)
							.setTimestamp()
						await interaction.editReply({ embeds: [embed] })
					} else {
						if (points == 1) {
							const embed = new MessageEmbed()
								.setColor('#36393f')
								.setAuthor(
									interaction.member.user.tag,
									interaction.member.user.avatarURL()
								)
								.setDescription(`${member} a ${points} point.`)
								.setTimestamp()
							await interaction.editReply({ embeds: [embed] })
						} else {
							const embed = new MessageEmbed()
								.setColor('#36393f')
								.setAuthor(
									interaction.member.user.tag,
									interaction.member.user.avatarURL()
								)
								.setDescription(`${member} a ${points} points.`)
								.setTimestamp()
							await interaction.editReply({ embeds: [embed] })
						}
					}
				} else {
					await interaction.editReply({
						content: 'Tu doit avoir le rôle actif pour utliser cette commande',
						ephemeral: true
					})
				}
				break
			}
			case 'rewards': {
				await interaction.deferReply()
				const userInDb = await mondecorteModel.findOne({
					id: interaction.member.id
				})
				const points = userInDb?.points || 0
				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor(
						`${interaction.member.user.tag} rewards`,
						interaction.member.user.avatarURL()
					)
					.setTimestamp()

				let hasActifRole = '❌'
				const arole = await interaction.guild.roles.cache.find(
					(role) => role.id === '842387653394563074'
				)
				if (interaction.member.roles.cache.has(arole.id)) {
					hasActifRole = '✅'
				}
				let hasCustomRole = '❌'
				const croleid = userInDb?.crole
				if (points >= 250) {
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
				if (points >= 500) {
					let pointsToLoose = 1
					pointToRemoveForPoints.forEach((e) => {
						if (e.need <= points) pointsToLoose = e.remove
					})

					if (pointsToLoose !== 1) {
						embed.addField(
							'Perte de points par heures',
							`\`\`\`Tu perds ${pointsToLoose} points par heure à cause que tu as ${points} points.\`\`\``,
							true
						)
					}
				}
				let hasColorful = '❌'
				const corole = interaction.guild.roles.cache.find(
					(role) => role.id === '857324294791364639'
				)
				if (interaction.member.roles.cache.has(corole.id)) {
					hasColorful = '✅'
				}
				const memberRole: string[] = []
				interaction.member.roles.cache.forEach((role) => {
					memberRole.push(role.name)
				})
				const response = await checkUserRole(memberRole, memberRole)
				const role = interaction.guild.roles.cache.find(
					(role) => role.id === '857324294791364639'
				)
				await performRole(response, role, interaction.member)

				embed.setDescription(`Voici une liste des récompense que tu a obtenu:
			- Rôle <@&857324294791364639>: ${hasColorful}
			- Rôle <@&842387653394563074>: ${hasActifRole}
			- Rôle <@&869637334126170112>: ${hasCustomRole}`)

				await interaction.editReply({ embeds: [embed] })
				break
			}
			case 'leaderboard': {
				await interaction.deferReply()
				if (
					interaction.member.roles.cache.has('842387653394563074') ||
					interaction.member.id == '324281236728053760'
				) {
					mondecorteModel.find({}).then(async (docs) => {
						const allPoints = docs
							.sort((a, b) => {
								return a.points - b.points
							})
							.reverse()

						const coolUser = []

						allPoints.forEach((user) => {
							if (user.points == 0) return
							coolUser.push(user.id)
						})

						const maxPage = Math.round(coolUser.length / 10)

						let page: number

						if (interaction.options.get('page') == null) {
							page = 1
						} else if (interaction.options.get('page').value > maxPage) {
							page = maxPage
						} else {
							page = interaction.options.get('page').value
						}

						async function getLeaderboard(page: number) {
							const text: Array<string> = []
							const max = page * 10 - 1
							const min = page * 10 - 10

							allPoints.slice(min, max + 1).forEach((user, index) => {
								if (user.points == 0) return
								if (page === 1) {
									text.push(
										`${intForEmote[index + 1]} <@${user.id}>: ${
											user.points
										} points`
									)
								} else {
									const math = page * 10 + index + 1 - 10
									text.push(`${math} <@${user.id}>: ${user.points} points`)
								}
							})

							let previousOn = false
							let nextOn = false

							if (page === 1) {
								previousOn = true
							}

							if (page === maxPage) {
								nextOn = true
							}

							const row = new MessageActionRow()
								.addComponents(
									new MessageButton()
										.setDisabled(previousOn)
										.setStyle('PRIMARY')
										.setCustomId('lb:page:previous')
										.setEmoji('◀️')
								)
								.addComponents(
									new MessageButton()
										.setDisabled(true)
										.setStyle('PRIMARY')
										.setCustomId('lb:label')
										.setLabel(page.toString())
								)
								.addComponents(
									new MessageButton()
										.setDisabled(nextOn)
										.setStyle('PRIMARY')
										.setCustomId('lb:page:next')
										.setEmoji('▶️')
								)

							return {
								text: text.join('\n'),
								row: row
							}
						}

						const leaderboardText = await getLeaderboard(page)

						const embed = new MessageEmbed()
							.setColor('#36393f')
							.setAuthor('Leaderboard du serveur', interaction.guild.iconURL())
							.setDescription(leaderboardText.text)
							.setTimestamp()
						await interaction.editReply({
							embeds: [embed],
							components: [leaderboardText.row]
						})

						const collector =
							interaction.channel.createMessageComponentCollector({
								time: 120000
							})

						collector.on('collect', async (i) => {
							if (i.member.id === interaction.member.id) {
								if (i.customId === 'lb:page:previous') {
									await i.deferUpdate()
									page = page - 1

									const lb = await getLeaderboard(page)
									const newEmbed = new MessageEmbed()
										.setColor('#36393f')
										.setAuthor(
											'Leaderboard du serveur',
											interaction.guild.iconURL()
										)
										.setDescription(lb.text)
										.setTimestamp()
									await interaction.editReply({
										embeds: [newEmbed],
										components: [lb.row]
									})
								} else if (i.customId === 'lb:page:next') {
									await i.deferUpdate()
									page = page + 1

									const lb = await getLeaderboard(page)
									const newEmbed = new MessageEmbed()
										.setColor('#36393f')
										.setAuthor(
											'Leaderboard du serveur',
											interaction.guild.iconURL()
										)
										.setDescription(lb.text)
										.setTimestamp()
									await interaction.editReply({
										embeds: [newEmbed],
										components: [lb.row]
									})
								}
							} else {
								i.reply({
									content: `These buttons aren't for you!`,
									ephemeral: true
								})
							}
						})

						collector.on('end', () => {
							interaction.editReply({
								components: []
							})
						})
					})
				} else {
					interaction.editReply({
						content: 'Tu doit avoir le rôle actif pour utliser cette commande'
					})
				}
				break
			}
		}
	}
}

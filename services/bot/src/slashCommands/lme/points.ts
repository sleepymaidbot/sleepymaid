import {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder
} from '@discordjs/builders'
import { ButtonStyle, Util } from 'discord.js'

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
	guildIds: ['324284116021542922'],
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
			subcommand
				.setName('leaderboard')
				.setDescription('See the server leaderboard')
				.addNumberOption((option) =>
					option.setName('page').setDescription('The page').setRequired(false)
				)
		)
		.toJSON(),

	async execute(interaction, client) {
		switch (interaction.options.getSubcommand()) {
			case 'user': {
				await interaction.deferReply()
				const user = interaction.options.get('user')
				let member
				let points
				if (user === null) {
					member = interaction.member.id
					const userInDb = await client.prisma.mondecorte.findUnique({
						where: {
							user_id: interaction.member.id
						}
					})
					points = userInDb?.points || 0
				} else {
					member = user.member.id
					const userInDb = await client.prisma.mondecorte.findUnique({
						where: {
							user_id: user.member.id
						}
					})
					points = userInDb?.points || 0
				}

				if (
					interaction.member.roles.cache.has('842387653394563074') ||
					interaction.member.id == '324281236728053760'
				) {
					if (points == 0) {
						const embed = new EmbedBuilder()
							.setColor(Util.resolveColor('#36393f'))
							.setAuthor({
								name: interaction.member.user.tag,
								iconURL: interaction.member.user.avatarURL()
							})
							.setDescription(
								`<@${member}> n'a pas de points. \nCommence par envoyer des message pour en avoir.`
							)
							.setTimestamp()
						await interaction.editReply({ embeds: [embed] })
					} else {
						if (points == 1) {
							const embed = new EmbedBuilder()
								.setColor(Util.resolveColor('#36393f'))
								.setAuthor({
									name: interaction.member.user.tag,
									iconURL: interaction.member.user.avatarURL()
								})
								.setDescription(`<@${member}> a ${points} point.`)
								.setTimestamp()
							await interaction.editReply({ embeds: [embed] })
						} else {
							const embed = new EmbedBuilder()
								.setColor(Util.resolveColor('#36393f'))
								.setAuthor({
									name: interaction.member.user.tag,
									iconURL: interaction.member.user.avatarURL()
								})
								.setDescription(`<@${member}> a ${points} points.`)
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
			case 'leaderboard': {
				await interaction.deferReply()
				if (
					interaction.member.roles.cache.has('842387653394563074') ||
					interaction.member.id == '324281236728053760'
				) {
					const docs = await client.prisma.mondecorte.findMany()
					const allPoints = docs
						.sort((a, b) => {
							return a.points - b.points
						})
						.reverse()

					const coolUser = []

					allPoints.forEach((user) => {
						if (user.points == 0) return
						coolUser.push(user.user_id)
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

					const getLeaderboard = (page: number) => {
						const text: Array<string> = []
						const max = page * 10 - 1
						const min = page * 10 - 10

						allPoints.slice(min, max + 1).forEach((user, index) => {
							if (user.points == 0) return
							if (page === 1) {
								text.push(
									`${intForEmote[index + 1]} <@${user.user_id}>: ${
										user.points
									} points`
								)
							} else {
								const math = page * 10 + index + 1 - 10
								text.push(`${math} <@${user.user_id}>: ${user.points} points`)
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

						const row = new ActionRowBuilder()
							.addComponents(
								new ButtonBuilder()
									.setDisabled(previousOn)
									.setStyle(ButtonStyle.Primary)
									.setCustomId('lb:page:previous')
									.setEmoji({ name: '◀️' })
							)
							.addComponents(
								new ButtonBuilder()
									.setDisabled(true)
									.setStyle(ButtonStyle.Primary)
									.setCustomId('lb:label')
									.setLabel(page.toString())
							)
							.addComponents(
								new ButtonBuilder()
									.setDisabled(nextOn)
									.setStyle(ButtonStyle.Primary)
									.setCustomId('lb:page:next')
									.setEmoji({ name: '▶️' })
							)

						return {
							text: text.join('\n'),
							row: row
						}
					}

					const leaderboardText = await getLeaderboard(page)

					const embed = new EmbedBuilder()
						.setColor(Util.resolveColor('#36393f'))
						.setAuthor({
							name: 'Leaderboard du serveur',
							iconURL: interaction.guild.iconURL()
						})
						.setDescription(leaderboardText.text)
						.setTimestamp()
					await interaction.editReply({
						embeds: [embed],
						components: [leaderboardText.row]
					})

					const collector = interaction.channel.createMessageComponentCollector(
						{
							time: 120000
						}
					)

					collector.on('collect', async (i) => {
						if (i.member.id === interaction.member.id) {
							if (i.customId === 'lb:page:previous') {
								await i.deferUpdate()
								page = page - 1

								const lb = await getLeaderboard(page)
								const newEmbed = new EmbedBuilder()
									.setColor(Util.resolveColor('#36393f'))
									.setAuthor({
										name: 'Leaderboard du serveur',
										iconURL: interaction.guild.iconURL()
									})
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
								const newEmbed = new EmbedBuilder()
									.setColor(Util.resolveColor('#36393f'))
									.setAuthor({
										name: 'Leaderboard du serveur',
										iconURL: interaction.guild.iconURL()
									})
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

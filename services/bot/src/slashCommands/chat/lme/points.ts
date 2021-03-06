import {
	SlashCommandBuilder,
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder,
	MessageActionRowComponentBuilder
} from '@discordjs/builders'
import { SlashCommandInterface } from '@sleepymaid/handler'
import {
	ButtonInteraction,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	resolveColor
} from 'discord.js'
import { APIEmbed, ButtonStyle } from 'discord-api-types/v10'
import { BotClient } from '../../../lib/extensions/BotClient'

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

export default class PointsCommand implements SlashCommandInterface {
	public readonly guildIds = ['324284116021542922']
	public readonly data = new SlashCommandBuilder()
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
		.toJSON() as ChatInputApplicationCommandData
	public async execute(
		interaction: ChatInputCommandInteraction,
		client: BotClient
	) {
		if (!interaction.inCachedGuild()) return
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
							.setColor(resolveColor('#36393f'))
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
								.setColor(resolveColor('#36393f'))
								.setAuthor({
									name: interaction.member.user.tag,
									iconURL: interaction.member.user.avatarURL()
								})
								.setDescription(`<@${member}> a ${points} point.`)
								.setTimestamp()
							await interaction.editReply({ embeds: [embed] })
						} else {
							const embed = new EmbedBuilder()
								.setColor(resolveColor('#36393f'))
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
						content: 'Tu doit avoir le r??le actif pour utliser cette commande'
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
						page = interaction.options.getInteger('page')
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

						if (page === 1) previousOn = true

						if (page === maxPage) nextOn = true

						const row = new ActionRowBuilder<ButtonBuilder>().addComponents([
							new ButtonBuilder()
								.setDisabled(previousOn)
								.setStyle(ButtonStyle.Primary)
								.setCustomId('lb:page:previous')
								.setEmoji({ name: '??????' }),
							new ButtonBuilder()
								.setDisabled(true)
								.setStyle(ButtonStyle.Primary)
								.setCustomId('lb:label')
								.setLabel(page.toString()),
							new ButtonBuilder()
								.setDisabled(nextOn)
								.setStyle(ButtonStyle.Primary)
								.setCustomId('lb:page:next')
								.setEmoji({ name: '??????' })
						])

						return {
							text: text.join('\n'),
							row: row as ActionRowBuilder<MessageActionRowComponentBuilder>
						}
					}

					const leaderboardText = getLeaderboard(page)

					const embed: APIEmbed = {
						color: resolveColor('#36393f'),
						author: {
							name: 'Leaderboard du serveur',
							icon_url: interaction.guild.iconURL()
						},
						description: leaderboardText.text,
						timestamp: new Date(Date.now()).toISOString()
					}
					await interaction.editReply({
						embeds: [embed],
						components: [leaderboardText.row]
					})

					const collector = interaction.channel.createMessageComponentCollector(
						{
							time: 120000
						}
					)

					collector.on('collect', async (i: ButtonInteraction) => {
						if (!i.inCachedGuild()) return
						if (i.member.id === interaction.member.id) {
							if (i.customId === 'lb:page:previous') {
								await i.deferUpdate()
								page = page - 1

								const lb = getLeaderboard(page)
								const newEmbed: APIEmbed = {
									color: resolveColor('#36393f'),
									author: {
										name: 'Leaderboard du serveur',
										icon_url: interaction.guild.iconURL()
									},
									description: lb.text,
									timestamp: new Date(Date.now()).toISOString()
								}
								await interaction.editReply({
									embeds: [newEmbed],
									components: [lb.row]
								})
							} else if (i.customId === 'lb:page:next') {
								await i.deferUpdate()
								page = page + 1

								const lb = getLeaderboard(page)
								const newEmbed: APIEmbed = {
									color: resolveColor('#36393f'),
									author: {
										name: 'Leaderboard du serveur',
										icon_url: interaction.guild.iconURL()
									},
									description: lb.text,
									timestamp: new Date(Date.now()).toISOString()
								}
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
						content: 'Tu doit avoir le r??le actif pour utliser cette commande'
					})
				}
				break
			}
		}
	}
}

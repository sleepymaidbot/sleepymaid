import { Message, resolveColor, TextChannel } from 'discord.js'
import {
	ActionRowBuilder,
	EmbedBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder
} from '@discordjs/builders'
import { inspect } from 'util'
import { ListenerInterface } from '@sleepymaid/handler'
import { BotClient } from '../../lib/extensions/BotClient'

export default class SetupListener implements ListenerInterface {
	public readonly name = 'messageCreate'
	public readonly once = false

	public async execute(message: Message, client: BotClient) {
		if (message.author.id !== '324281236728053760') return
		const content = message.content.split(' ')
		const cmd = content[0]
		if (!cmd.startsWith(client.config.prefix)) return
		switch (cmd.slice(1)) {
			case 'compilevote': {
				const userVote = {}

				const findHighest = (obj) => {
					const values = Object.values(obj)
					// eslint-disable-next-line prefer-spread
					const max = Math.max.apply(Math, values)
					for (const key in obj) {
						if (obj[key] === max) {
							return [key, max]
						}
					}
				}

				const docs = await client.prisma.mondecorte.findMany()
				docs.forEach(async (doc) => {
					if (doc.vote) {
						if (userVote[doc.vote]) {
							userVote[doc.vote] = userVote[doc.vote] + 1
						} else {
							userVote[doc.vote] = 1
						}
					}
				})

				message.channel.send(`The highest vote is ${findHighest(userVote)[0]}`)
				break
			}
			case 'eval': {
				const codetoeval = message.content.split(' ').slice(1).join(' ')
				try {
					if (
						codetoeval.includes(
							`token` ||
								`env` ||
								`message.channel.delete` ||
								`message.guild.delete` ||
								`delete`
						)
					) {
						return message.channel.send(`no`)
					}

					const evalOutputEmbed = new EmbedBuilder()
						.setTitle('Evaluated Code')
						.addFields([
							{
								name: `:inbox_tray: **Input**`,
								value: `\`\`\`js\n${codetoeval}\`\`\``
							}
						])

					try {
						const output = await eval(`(async () => {${codetoeval}})()`)
						if (
							await inspect(output).includes(
								client.config.token || 'message.channel.delete()'
							)
						) {
							return message.channel.send(`no`)
						}

						if (inspect(output, { depth: 0 }).length > 1000) {
							return
						} else {
							evalOutputEmbed.addFields([
								{
									name: `:outbox_tray: **Output**`,
									value: `\`\`\`js\n${inspect(output, { depth: 0 })}\`\`\``
								}
							])
						}
						await message.channel.send({ embeds: [evalOutputEmbed] })
					} catch (e) {
						const output = e.message
						if (
							inspect(output).includes(
								client.config.token || 'message.channel.delete()'
							)
						) {
							return message.channel.send(`no`)
						}

						if (inspect(output, { depth: 0 }).length > 1000) {
							return
						} else {
							evalOutputEmbed.addFields([
								{
									name: `:outbox_tray: **Error**`,
									value: `\`\`\`js\n${inspect(output, { depth: 0 })}\`\`\``
								}
							])
						}
						await message.channel.send({ embeds: [evalOutputEmbed] })
						await client.logger.error(e)
					}
				} catch (err) {
					client.logger.error(err)
				}
				break
			}
			case 'setupVote': {
				const maire = []

				const channel = (await message.guild.channels.fetch(
					'944033597583679508'
				)) as TextChannel
				const messages = await channel.messages.fetch()

				messages.forEach((message: Message) => {
					maire.push({
						value: message.member.user.id,
						label: message.member.user.tag
					})
				})

				if (maire.length === 0) message.channel.send(':poop:')
				const embed = new EmbedBuilder()
					.setColor(resolveColor('#36393f'))
					.setAuthor({
						name: message.guild.name,
						iconURL: message.guild.iconURL()
					})
					.setTitle('Élection du maire du serveur')
					.setDescription(
						"Va lire les candidatures dans <#944033597583679508>.\nEnsuite, sélectionner la personne que vous voulez voter.\nVous ne pouvez sélectionner qu'une fois et une personne."
					)
					.setTimestamp()

				const row = new ActionRowBuilder<SelectMenuBuilder>().addComponents([
					new SelectMenuBuilder()
						.setCustomId('vote')
						.setPlaceholder('Aucun vote')
						.setMaxValues(1)
						.setMinValues(1)
						.addOptions(
							maire.map((option) => new SelectMenuOptionBuilder(option))
						)
				])

				await message.channel.send({
					embeds: [embed],
					components: [row]
				})
				break
			}
			case 'removeAllVote': {
				await client.prisma.mondecorte.updateMany({
					data: {
						vote: null
					}
				})
				break
			}
		}
	}
}

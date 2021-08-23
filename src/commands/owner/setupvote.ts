import { Command } from 'discord-akairo'
import {
	MessageActionRow,
	MessageEmbed,
	MessageSelectMenu,
	TextChannel
} from 'discord.js'
import { config } from '../../config/config'
export default class setupVote extends Command {
	constructor() {
		super('setupVote', {
			aliases: ['setupVote'],
			category: 'owner',
			prefix: config.devprefix,
			channel: 'guild',
			ownerOnly: true
		})
	}

	async exec(message) {
		const channel = (await message.guild.channels.fetch(
			'877679633062064129'
		)) as TextChannel

		const maire = []

		await channel.messages
			.fetch()
			.then((fmessage) => {
				fmessage.forEach((msg) => {
					if (msg.author.bot) return
					if (msg.author.id === message.guild.ownerId) return
					if (
						maire.includes({
							label: msg.author.tag,
							value: msg.author.id
						})
					)
						return
					maire.push({
						label: msg.author.tag,
						value: msg.author.id
					})
				})
			})
			.catch(console.error)

		const embed = new MessageEmbed()
			.setColor('#36393f')
			.setAuthor(message.guild.name, message.guild.iconURL)
			.setTitle('Élection du maire du serveur')
			.setDescription(
				"Va lire les candidatures dans <#877679633062064129>.\nEnsuite, sélectionner la personne que vous voulez voter.\nVous ne pouvez qu'une fois et une personne."
			)
			.setTimestamp()

		const row = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId('vote')
				.setPlaceholder('Aucun vote')
				.setMaxValues(1)
				.setMinValues(1)
				.addOptions(maire)
		)

		await message.channel.send({
			embeds: [embed],
			components: [row]
		})
	}
}

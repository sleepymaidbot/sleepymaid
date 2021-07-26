import { BotCommand } from '../../lib/extensions/BotCommand'
import {
	MessageEmbed,
	MessageActionRow,
	MessageButton,
	MessageSelectMenu
} from 'discord.js'
import { colorRole } from '../../config/lists'
export default class color_message_command extends BotCommand {
	constructor() {
		super('color_message_setup', {
			aliases: ['color_message_setup'],
			ownerOnly: true,
			channel: 'guild'
		})
	}

	async exec(message) {
		// eslint-disable-next-line prefer-const
		let roleArray: string[] = []
		colorRole.forEach((rolename) => {
			const role = message.guild.roles.cache.find(
				(role) => role.name === rolename
			)
			const rolePingString = `<@&${role.id}>\n`
			roleArray.push(rolePingString)
		})
		const displayRoleString = roleArray.join(' ')
		const embed = new MessageEmbed()
			.setColor('#36393f')
			.setTitle('Choix de couleur.')
			.setDescription(
				`Clique sur un bouton pour avoir\n la couleur de ton choix.\n${displayRoleString}`
			)

		const row = new MessageActionRow().addComponents(
			new MessageSelectMenu()
				.setCustomId('select')
				.setPlaceholder('Nothing selected')
				.addOptions([
					{
						label: 'Maya',
						value: 'Maya'
					},
					{
						label: 'Mikado',
						value: 'Mikado'
					},
					{
						label: 'Rose',
						value: 'Rose'
					},
					{
						label: 'Lavender',
						value: 'Lavender'
					},
					{
						label: 'Coral',
						value: 'Coral'
					},
					{
						label: 'Cantaloupe',
						value: 'Cantaloupe'
					},
					{
						label: 'Mint',
						value: 'Mint'
					},
					{
						label: 'Weed',
						value: 'Weed'
					},
					{
						label: 'Smoked',
						value: 'Smoked'
					}
				])
		)

		const remove = new MessageActionRow().addComponents(
			new MessageButton()
				.setCustomId('remove')
				.setLabel('Remove my color')
				.setStyle('DANGER')
		)

		message.channel.send({ embeds: [embed], components: [row, remove] })
	}
}

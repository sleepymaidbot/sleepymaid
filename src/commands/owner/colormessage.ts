import { BotCommand } from '../../lib/extensions/BotCommand';
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';

const colorRole = [
	'Maya',
	'Mikado',
	'Rose',
	'Lavender',
	'Coral',
	'Cantaloupe',
	'Mint'
];
export default class color_message_command extends BotCommand {
	constructor() {
		super('color_message_setup', {
			aliases: ['color_message_setup'],
			ownerOnly: true,
			channel: 'guild'
		});
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	async exec(message) {
		// eslint-disable-next-line prefer-const
		let roleArray: string[] = [];
		colorRole.forEach((rolename) => {
			const role = message.guild.roles.cache.find(
				(role) => role.name === rolename
			);
			const rolePingString = `<@&${role.id}>\n`;
			roleArray.push(rolePingString);
		});
		const displayRoleString = roleArray.join(' ');
		const embed = new MessageEmbed()
			.setColor('#36393f')
			.setTitle('Choix de couleur.')
			.setDescription(
				`Clique sur un bouton pour avoir\n la couleur de ton choix.\n${displayRoleString}`
			);

		const row1 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomID('Maya')
					.setLabel('Maya')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('Mikado')
					.setLabel('Mikado')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('Rose')
					.setLabel('Rose')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('Lavender')
					.setLabel('Lavender')
					.setStyle('PRIMARY')
			);
		const row2 = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomID('Coral')
					.setLabel('Coral')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('Cantaloupe')
					.setLabel('Cantaloupe')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('Mint')
					.setLabel('Mint')
					.setStyle('PRIMARY')
			);

		return message.channel.send({ embeds: [embed], components: [row1, row2] });
	}
}

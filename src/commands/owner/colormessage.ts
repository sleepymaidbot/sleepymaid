import { BotCommand } from '../../lib/extensions/BotCommand';
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';

export default class color_message_command extends BotCommand {
	constructor() {
		super('color_message_setup', {
			aliases: ['color_message_setup'],
			ownerOnly: true,
			channel: 'guild'
		});
	}

	async exec(message, args) {
		const embed = new MessageEmbed()
			.setColor('#36393f')
			.setTitle('Choix de couleur.')
			.setDescription(
				'Clique sur un bouton pour avoir\n la couleur de ton choix.'
			);

		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomID('primary')
					.setLabel('primary')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('second')
					.setLabel('second')
					.setStyle('PRIMARY')
			);

		return message.channel.send({ embeds: [embed], components: [row] });
	}
}

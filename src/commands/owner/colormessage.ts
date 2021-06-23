import { BotCommand } from '../../lib/extensions/BotCommand';
import { MessageEmbed, MessageActionRow, MessageButton } from 'discord.js';


const colorRole = ['Maya', 'Mikado', 'Rose', 'Lavender', 'Coral', 'Cantaloupe', 'Mint'];
export default class color_message_command extends BotCommand {
	constructor() {
		super('color_message_setup', {
			aliases: ['color_message_setup'],
			ownerOnly: true,
			channel: 'guild'
		});
	}

	async exec(message, args) {
		// eslint-disable-next-line prefer-const
		let roleArray: string[] = []
		colorRole.forEach(rolename => {
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
					.setCustomID('maya')
					.setLabel('Maya')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('mikado')
					.setLabel('Mikado')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('rose')
					.setLabel('Rose')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('lavender')
					.setLabel('Lavender')
					.setStyle('PRIMARY')
		)
		const row2 = new MessageActionRow()			
			.addComponents(
				new MessageButton()
					.setCustomID('coral')
					.setLabel('Coral')
					.setStyle('PRIMARY')
			)
			.addComponents(
				new MessageButton()
					.setCustomID('cantaloupe')
					.setLabel('Cantaloupe')
					.setStyle('PRIMARY')
		  )
		  .addComponents(
				new MessageButton()
					.setCustomID('mint')
					.setLabel('Mint')
					.setStyle('PRIMARY')
			);
			
		return message.channel.send({ embeds: [embed], components: [row1, row2] });
	}
}

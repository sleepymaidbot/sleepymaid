import { BotCommand } from '../../../lib/extensions/BotCommand';
import { userActivityModel } from '../../../functions/db'
import { MessageEmbed } from 'discord.js';

export default class pointsCommand extends BotCommand {
	constructor() {
		super('points', {
			aliases: ['points', 'mypoints'],
			ownerOnly: true,
			channel: 'guild',
			args: [
				{
					id: 'member',
					type: 'member',
					default: (message) => message.member
				}
			]
		});
	}

	async exec(message, args) {
		if (message.guild.id != '324284116021542922') return;
		const userInDB = await userActivityModel.findOne({ id: args.member.id });
		if (userInDB == null) {
			const embed = new MessageEmbed()
				.setColor('#36393f')
				.setAuthor(message.author.tag, message.author.avatarURL())
				.setDescription(
					`<@${args.member.id}> n'a pas de points. \nCommence pas envoyer des message pour en avoir.`
				)
				.setTimestamp();
			message.reply({ embeds: [embed] });
		} else {
			if (userInDB.points == 1) {
				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor(message.author.tag, message.author.avatarURL())
					.setDescription(`<@${args.member.id}> a ${userInDB.points} point.`)
					.setTimestamp();
				message.reply({ embeds: [embed] });
			} else {
				const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor(message.author.tag, message.author.avatarURL())
					.setDescription(`<@${args.member.id}> a ${userInDB.points} points.`)
					.setTimestamp();
				message.reply({ embeds: [embed] });
			}
		}
	}
}

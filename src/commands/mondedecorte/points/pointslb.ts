import { BotCommand } from '../../../lib/extensions/BotCommand';
import { Message, MessageEmbed } from 'discord.js';
import { activity } from '../../../functions/db';

interface User {
	id: string;
	points: number;
}

export default class pointsLeaderboardCommand extends BotCommand {
	constructor() {
		super('pointsLb', {
			aliases: ['pointslb'],
			channel: 'guild'
		});
	}

	exec(message: Message) {
		var allPoints: Array<User>;
		activity.find({}).then((docs) => {
			allPoints = docs;

			allPoints.sort((a, b) => {
				return a.points - b.points;
			});

            const coolList: Array<string> = []

            allPoints.reverse().forEach((user) => {
                if (user.points == 0) {
                    return
                } else {
                    coolList.push(`<@${user.id}>: ${user.points}`)
                }
            })

            const embed = new MessageEmbed()
					.setColor('#36393f')
					.setAuthor("Leaderboard du serveur", message.guild.iconURL())
					.setDescription(coolList.slice(0, 10).join('\n'))
					.setTimestamp();
            message.reply({ embeds: [embed] });
		});
	}
}

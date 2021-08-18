import { Command } from 'discord-akairo'
import { Message, MessageEmbed } from 'discord.js'
import { config } from '../../../config/config'
import { mondecorteModel } from '../../../lib/utils/db'

export default class PointsAdminCommand extends Command {
	constructor() {
		super('pointsadmin', {
			aliases: ['pointsadmin'],
			prefix: `dev.${config.prefix}`,
			args: [
				{
					id: 'member',
					type: 'member'
				},
				{
					id: 'points',
					type: 'integer'
				}
			],
			category: 'points',
			ownerOnly: true
		})
	}

	async exec(message: Message, args) {
		const oldUser = await mondecorteModel.findOne({ id: args.member.id })
		const embed = new MessageEmbed()
			.setColor('#36393f')
			.setAuthor(message.author.tag, message.author.avatarURL())
			.setDescription(`Changement des points de <@${args.member.id}>`)
			.addField('Avant', `\`\`\`${oldUser.points}\`\`\``, true)
			.setTimestamp()
		oldUser.points = args.points
		const newUser = await oldUser.save()
		embed.addField('Après', `\`\`\`${newUser.points}\`\`\``, true)
		return await message.channel.send({
			embeds: [embed]
		})
	}
}

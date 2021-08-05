import { Message, MessageEmbed } from 'discord.js'
import { BotCommand } from '../../lib/extensions/BotCommand'
import { slashGuildsIds } from '../../config/lists'

export default class PingCommand extends BotCommand {
	constructor() {
		super('ping', {
			aliases: ['ping'],
			category: 'info',
			slash: true,
			slashGuilds: slashGuildsIds,
			description: 'Gets the latency of the bot'
		})
	}

	public async exec(message: Message): Promise<void> {
		const sentMessage = await message.util.send('Pong!')
		const timestamp: number = message.editedTimestamp
			? message.editedTimestamp
			: message.createdTimestamp
		const botLatency = `\`\`\`\n ${Math.floor(
			sentMessage.createdTimestamp - timestamp
		)}ms \`\`\``
		const apiLatency = `\`\`\`\n ${Math.round(message.client.ws.ping)}ms \`\`\``
		const pingEmbed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Bot Latency', botLatency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(
				message.author.username,
				message.author.displayAvatarURL({ dynamic: true })
			)
			.setTimestamp()
		await sentMessage.edit({ content: null, embeds: [pingEmbed] })
	}

	public async execSlash(message): Promise<void> {
		const timestamp1 = message.createdTimestamp
		await message.reply('Pong!')
		const timestamp2 = await message
			.fetchReply()
			.then((m) => (m as Message).createdTimestamp)
		const botLatency = `\`\`\`\n ${Math.floor(
			timestamp2 - timestamp1
		)}ms \`\`\``
		const apiLatency = `\`\`\`\n ${Math.round(this.client.ws.ping)}ms \`\`\``
		const embed = new MessageEmbed()
			.setTitle('Pong!  🏓')
			.addField('Bot Latency', botLatency, true)
			.addField('API Latency', apiLatency, true)
			.setFooter(
				message.user.username,
				message.user.displayAvatarURL({ dynamic: true })
			)
			.setTimestamp()
		await message.editReply({
			content: null,
			embeds: [embed]
		})
	}
}

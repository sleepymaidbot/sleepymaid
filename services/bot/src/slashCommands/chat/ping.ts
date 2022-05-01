import { SlashCommand } from '@sleepymaid/handler'
import {
	ApplicationCommandType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	Message
} from 'discord.js'
import { BotClient } from '../../lib/extensions/BotClient'

export default new SlashCommand(
	{
		data: {
			name: 'ping',
			description: 'Gets the latency of the bot',
			type: ApplicationCommandType.ChatInput
		}
	},
	{
		async run(interaction: ChatInputCommandInteraction, client: BotClient) {
			if (!interaction.inCachedGuild()) return
			const timestamp1 = interaction.createdTimestamp
			await interaction.reply('Pong!')
			const timestamp2 = await interaction
				.fetchReply()
				.then((m) => (m as Message).createdTimestamp)
			const botLatency = `\`\`\`\n ${Math.floor(
				timestamp2 - timestamp1
			)}ms \`\`\``
			const apiLatency = `\`\`\`\n ${Math.round(client.ws.ping)}ms \`\`\``
			const embed = new EmbedBuilder()
				.setTitle('Pong!  🏓')
				.addFields(
					{
						name: client.localizer.get('ping.bot_lantency', {
							lng: interaction.locale
						}),
						value: botLatency,
						inline: true
					},
					{
						name: client.localizer.get('ping.api_latency', {
							lng: interaction.locale
						}),
						value: apiLatency,
						inline: true
					}
				)
				.setFooter({
					text: interaction.user.username,
					iconURL: interaction.user.displayAvatarURL()
				})
				.setTimestamp()
			await interaction.editReply({
				content: null,
				embeds: [embed]
			})
		}
	}
)

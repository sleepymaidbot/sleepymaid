import { Message } from 'discord.js'
import { EmbedBuilder } from '@discordjs/builders'
import { inspect } from 'util'
import { ListenerInterface } from '@sleepymaid/handler'
import { BotClient } from '../../lib/extensions/BotClient'

export default class SetupListener implements ListenerInterface {
	public readonly name = 'messageCreate'
	public readonly once = false

	public async execute(message: Message, client: BotClient) {
		if (message.author.id !== '324281236728053760') return
		const content = message.content.split(' ')
		const cmd = content[0]
		if (!cmd.startsWith(client.config.prefix)) return
		switch (cmd.slice(1)) {
			case 'eval': {
				const codetoeval = message.content.split(' ').slice(1).join(' ')
				try {
					if (
						codetoeval.includes(
							`token` ||
								`env` ||
								`message.channel.delete` ||
								`message.guild.delete` ||
								`delete`
						)
					) {
						return message.channel.send(`no`)
					}

					const evalOutputEmbed = new EmbedBuilder()
						.setTitle('Evaluated Code')
						.addFields([
							{
								name: `:inbox_tray: **Input**`,
								value: `\`\`\`js\n${codetoeval}\`\`\``
							}
						])

					try {
						const output = await eval(`(async () => {${codetoeval}})()`)
						if (
							await inspect(output).includes(
								client.config.token || 'message.channel.delete()'
							)
						) {
							return message.channel.send(`no`)
						}

						if (inspect(output, { depth: 0 }).length > 1000) {
							return
						} else {
							evalOutputEmbed.addFields([
								{
									name: `:outbox_tray: **Output**`,
									value: `\`\`\`js\n${inspect(output, { depth: 0 })}\`\`\``
								}
							])
						}
						await message.channel.send({ embeds: [evalOutputEmbed] })
					} catch (e) {
						const output = e.message
						if (
							inspect(output).includes(
								client.config.token || 'message.channel.delete()'
							)
						) {
							return message.channel.send(`no`)
						}

						if (inspect(output, { depth: 0 }).length > 1000) {
							return
						} else {
							evalOutputEmbed.addFields([
								{
									name: `:outbox_tray: **Error**`,
									value: `\`\`\`js\n${inspect(output, { depth: 0 })}\`\`\``
								}
							])
						}
						await message.channel.send({ embeds: [evalOutputEmbed] })
						await client.logger.error(e)
					}
				} catch (err) {
					client.logger.error(err)
				}
				break
			}
		}
	}
}

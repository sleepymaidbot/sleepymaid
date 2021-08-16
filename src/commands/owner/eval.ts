import {
	Message,
	MessageEmbed,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	MessageActionRow,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	MessageButton
} from 'discord.js'
import { inspect } from 'util'
import { Command } from 'discord-akairo'
import { config } from '../../config/config'
export default class evaluate extends Command {
	constructor() {
		super('eval', {
			aliases: ['eval', 'ev', 'exec'],
			prefix: `dev.${config.prefix}`,
			args: [
				{ id: 'codetoeval', type: 'string', match: 'rest' },
				{ id: 'silent', match: 'flag', flag: '--silent' },
				{ id: 'sudo', match: 'flag', flag: '--sudo' }
			],
			ownerOnly: true,
			channel: 'guild'
		})
	}

	async exec(message: Message, args) {
		try {
			if (
				args.codetoeval.includes(
					`token` ||
						`env` ||
						`message.channel.delete` ||
						`message.guild.delete` ||
						`delete`
				)
			) {
				return message.channel.send(`no`)
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const client = this.client

			const output = await eval(args.codetoeval)

			if (
				inspect(output).includes(config.token || 'message.channel.delete()')
			) {
				return message.channel.send(`no`)
			}

			const evalOutputEmbed = new MessageEmbed()
				.setTitle('Evaluated Code')
				.addField(
					`:inbox_tray: **Input**`,
					`\`\`\`js\n${args.codetoeval}\`\`\``
				)

			if (inspect(output, { depth: 0 }).length > 1000) {
				return
			} else {
				evalOutputEmbed.addField(
					`:outbox_tray: **Output**`,
					`\`\`\`js\n${inspect(output, { depth: 0 })}\`\`\``
				)
			}

			if (args.silent) {
				if (args.codetoeval.includes('message.delete')) {
					return
				}
			} else {
				await message.channel.send({ embeds: [evalOutputEmbed] })
			}
		} catch (err) {
			if (err.length > 10) {
				message.channel.send(`\`\`\`js\n${err}\`\`\``)
			} else console.error(err)
		}
	}
}

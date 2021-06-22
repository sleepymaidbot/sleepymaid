import { MessageEmbed } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MessageActionRow, MessageButton } from 'discord.js'
import { inspect } from 'util';
import { Command } from 'discord-akairo';
import * as config from '../../config/options';

export default class evaluate extends Command {
	constructor() {
		super('eval', {
			aliases: ['eval', 'ev', 'exec'],
			args: [
				{ id: 'codetoeval', type: 'string', match: 'rest' },
				{ id: 'silent', match: 'flag', flag: '--silent' },
				{ id: 'sudo', match: 'flag', flag: '--sudo' }
			],
			ownerOnly: true,
			channel: 'guild'
		});
	}

	// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
	async exec(message, args) {
		try {
			if (args.codetoeval.includes(`token` || `env` || `message.channel.delete` || `message.guild.delete` || (`delete`))) {
				return message.channel.send(`no`);
			}

			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const guild = message.guild;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const client = this.client;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const channel = message.channel;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const embed = new MessageEmbed();
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const user = message.author;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const member = message.member;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const botUser = this.client.user;
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const botMember = message.guild.me;

			const output = await eval(args.codetoeval);

			if (inspect(output).includes(config.token || 'message.channel.delete()')) {
				return message.channel.send(`no`);
			}

			const evalOutputEmbed = new MessageEmbed()
					.setTitle('Evaluated Code')
					.addField(
						`:inbox_tray: **Input**`,
						`\`\`\`js\n${args.codetoeval}\`\`\``
					);

			if (inspect(output, { depth: 0 }).length > 1000) {
				return;
			} else {
					evalOutputEmbed.addField(
						`:outbox_tray: **Output**`,
						`\`\`\`js\n${inspect(output, { depth: 0 })}\`\`\``
					);
				}

			await message.channel.send({ embeds: [evalOutputEmbed] });
			if (args.silent) {
				if (args.codetoeval.includes('message.delete')) {
					return;
				}
				message.react(`✅`);
			}
		} catch (err) {
			console.log(err);
		}
	}
}

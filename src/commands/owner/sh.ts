import { MessageEmbed } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MessageActionRow, MessageButton } from 'discord.js';
import { inspect, promisify } from 'util';
import { Command } from 'discord-akairo';
import { exec } from 'child_process';

const sh = promisify(exec);
export default class evaluate extends Command {
	constructor() {
		super('sh', {
			aliases: ['sh'],
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
			let output;

			exec(args.codetoeval, (err, stdout, stderr) => {
				if (err) {
					console.error(err);
				} else {
					output = stdout;
				}
			});

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
					`\`\`\`js\n${inspect(output)}\`\`\``
				);
			}

			await message.channel.send({ embeds: [evalOutputEmbed] });
			if (args.silent) {
				message.react(`✅`);
			}
		} catch (err) {
			console.log(err);
		}
	}
}

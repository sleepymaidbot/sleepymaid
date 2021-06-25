import { MessageEmbed } from 'discord.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { inspect } from 'util';
import { Command } from 'discord-akairo';

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

      const output = await eval(`sh(${args.codetoeval})`)

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

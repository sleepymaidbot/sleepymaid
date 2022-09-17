import { resolveColor } from 'discord.js';
import { EmbedBuilder } from '@discordjs/builders';
import { ListenerInterface } from '@sleepymaid/handler';

const month = {
	0: 'Janvier',
	1: 'Février',
	2: 'Mars',
	3: 'Avril',
	4: 'Mai',
	5: 'Juin',
	6: 'Juillet',
	7: 'Août',
	8: 'Septembre',
	9: 'Octobre',
	10: 'Novembre',
	11: 'Décembre',
};

function returnCurentTime() {
	const d = new Date();
	let min = d.getMinutes().toString();
	if (d.getMinutes() <= 9) min = '0' + min;
	return `${month[d.getMonth()]} ${d.getDate()} ${d.getHours()}:${min} ${d.getFullYear()}`;
}

const logChannelId = '821509142518824991';

export default class VoiceLogListener implements ListenerInterface {
	public readonly name = 'voiceStateUpdate';
	public readonly once = false;

	async execute(oldState, newState, client) {
		if (newState.guild.id !== '324284116021542922') return;
		if (client.config.environment === 'development') return;
		// Join
		if (oldState.channel == null && newState.channel != null) {
			const guild = newState.guild;
			const logChannel = guild.channels.cache.get(logChannelId);

			const embed = new EmbedBuilder()
				.setTitle('Presence Update')
				.setDescription(`**${newState.member.user.tag}** has joined **${newState.channel.name}**.`)
				.setColor(resolveColor('#409400'))
				.setFooter({ text: returnCurentTime() });

			try {
				await logChannel.send({ embeds: [embed] });
			} catch (e) {
				client.logger.error(e);
			}
		}
		// Leave
		else if (oldState.channel != null && newState.channel == null) {
			const guild = newState.guild;
			const logChannel = guild.channels.cache.get(logChannelId);

			const embed = new EmbedBuilder()
				.setTitle('Presence Update')
				.setDescription(`**${newState.member.user.tag}** has left **${oldState.channel.name}**.`)
				.setColor(resolveColor('#409400'))
				.setFooter({ text: returnCurentTime() });

			try {
				await logChannel.send({ embeds: [embed] });
			} catch (e) {
				client.logger.error(e);
			}
		}
		// Move
		else if (oldState.channel != newState.channel) {
			const guild = newState.guild;
			const logChannel = guild.channels.cache.get(logChannelId);

			const embed = new EmbedBuilder()
				.setTitle('Presence Update')
				.setDescription(
					`**${newState.member.user.tag}** has moved from **${oldState.channel.name}** to **${newState.channel.name}**.`,
				)
				.setColor(resolveColor('#409400'))
				.setFooter({ text: returnCurentTime() });

			try {
				await logChannel.send({ embeds: [embed] });
			} catch (e) {
				client.logger.error(e);
			}
		}
	}
}

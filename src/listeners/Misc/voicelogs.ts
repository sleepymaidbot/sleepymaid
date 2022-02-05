import { MessageEmbed } from 'discord.js'

module.exports = {
	name: 'voiceStateUpdate',
	once: false,

	async execute(oldState, newState, client) {
		if (newState.guild.id !== '324284116021542922') return
		// Join
		if (oldState.channel == null && newState.channel != null) {
			const guild = newState.guild
			const logChannel = guild.channels.cache.get('821509142518824991')

			const embed = new MessageEmbed()
				.setTitle('Presence Update')
				.setDescription(
					`**${newState.member.user.tag}** has joined **${newState.channel.name}**.`
				)
				.setColor('#409400')

			try {
				await logChannel.send({ embeds: [embed] })
			} catch (e) {
				client.logger.error(e)
			}
		}
		// Leave
		else if (oldState.channel != null && newState.channel == null) {
			const guild = newState.guild
			const logChannel = guild.channels.cache.get('821509142518824991')

			const embed = new MessageEmbed()
				.setTitle('Presence Update')
				.setDescription(
					`**${newState.member.user.tag}** has left **${oldState.channel.name}**.`
				)
				.setColor('#409400')

			try {
				await logChannel.send({ embeds: [embed] })
			} catch (e) {
				client.logger.error(e)
			}
		}
		// Move
		else if (oldState.channel != newState.channel) {
			const guild = newState.guild
			const logChannel = guild.channels.cache.get('821509142518824991')

			const embed = new MessageEmbed()
				.setTitle('Presence Update')
				.setDescription(
					`**${newState.member.user.tag}** has moved from **${oldState.channel.name}** to **${newState.channel.name}**.`
				)
				.setColor('#409400')

			try {
				await logChannel.send({ embeds: [embed] })
			} catch (e) {
				client.logger.error(e)
			}
		}
	}
}

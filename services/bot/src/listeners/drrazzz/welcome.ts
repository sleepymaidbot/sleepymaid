import { EmbedBuilder } from '@discordjs/builders'
import { ListenerInterface } from '@sleepymaid/handler'
import { GuildMember, TextChannel } from 'discord.js'

export default class DrrazzWelcomeListener implements ListenerInterface {
	public readonly name = 'guildMemberAdd'
	public readonly once = false

	public async execute(member: GuildMember) {
		if (member.guild.id !== '818313526720462868') return
		const role = member.guild.roles.cache.get('818475324631023656')
		await member.roles.add(role)

		const ruleChannel = member.guild.channels.cache.get(
			'818314179508568126'
		) as TextChannel
		const generalChannel = member.guild.channels.cache.get(
			'818313526720462870'
		) as TextChannel

		const embed = new EmbedBuilder()
			.setAuthor({
				name: 'Bienvenue!',
				iconURL: 'https://cdn.discordapp.com/emojis/612355003151286278.gif'
			})
			.setDescription(
				`Bienvenue ${member} sur le serveur de DrraZz_.\nJe te conseil d'aller lire les règle du serveur dans <#818314179508568126>.\nSi tu veux avoir des notification quand <@377944202710876161> va en live sur twitch ou sort une nouvelle vidéo sur youtube va dans <#818474275362963486>.`
			)
			.setColor(0x36393f)

		await generalChannel.send({ embeds: [embed] })
		const ruleMessage = await ruleChannel.send({
			content: `${member} Merci de lire les règlements!`
		})
		setTimeout(async () => {
			await ruleMessage.delete()
		}, 10000)
	}
}

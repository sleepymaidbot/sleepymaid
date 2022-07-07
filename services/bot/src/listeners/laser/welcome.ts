import { ListenerInterface } from '@sleepymaid/handler'
import { GuildMember } from 'discord.js'
import { BotClient } from '../../lib/extensions/BotClient'

export default class WelcomeListener implements ListenerInterface {
	public readonly name = 'guildMemberAdd'
	public readonly once = false

	public async execute(member: GuildMember, client: BotClient) {
		if (member.guild.id !== '860721584373497887') return
		const role = member.guild.roles.cache.get('872029952046927922')
		await member.roles.add(role)
	}
}

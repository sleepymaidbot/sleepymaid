import { Listener } from '@sleepymaid/handler'

export default new Listener(
	{
		name: 'guildMemberAdd',
		once: false
	},
	{
		async run(member, _client) {
			if (member.guild.id !== '860721584373497887') return
			const role = await member.guild.roles.cache.get('872029952046927922')
			await member.roles.add(role)
		}
	}
)

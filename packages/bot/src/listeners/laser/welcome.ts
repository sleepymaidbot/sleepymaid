module.exports = {
	name: 'guildMemberAdd',
	once: false,

	async execute(member) {
		if (member.guild.id !== '860721584373497887') return
		const role = await member.guild.roles.cache.get('872029952046927922')
		await member.roles.add(role)
	}
}

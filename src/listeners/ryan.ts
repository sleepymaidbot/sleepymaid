module.exports = {
	name: 'messageCreate',
	once: false,

	async execute(message) {
		if (message.content.lenght === 0 && message.author.id === '564122371385196546') {
			const role = message.guild.roles.cache.find(
				(r) => r.id === '862462288345694210'
			)

			message.member.roles.add(role)

			message.author.send('yo parle a ecorte sinon tu pu')

			message.delete()
		}
	}
}

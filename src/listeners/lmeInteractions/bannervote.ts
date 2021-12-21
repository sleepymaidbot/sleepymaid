const userBl = [
	'324281236728053760',
	'613040835684073506',
	'599315471640297502'
]

module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		if (userBl.includes(message.author.id)) return
		if (message.channel.id === '878370280941183016') {
			message.react('✅')
			message.react('❌')
		} else if (message.channel.id === '892162546277187654') {
			message.react('🔼')
		}
	}
}

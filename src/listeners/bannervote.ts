module.exports = {
	name: 'messageCreate',
	once: false,
	async execute(message) {
		if (message.channel.id === '878370280941183016') {
			message.react('✅')
			message.react('❌')
		}
	}
}

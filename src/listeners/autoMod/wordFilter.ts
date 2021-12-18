import { Message } from 'discord.js'

module.exports = {
	name: 'messageCreate',
	once: false,

	async execute(message: Message) {
		if (message.author.id === '324281236728053760') return
		if (message.guild.id !== '324284116021542922') return
		const str = message.content.replace(/ /g, '')
		str.replace(/‎ /g, '')
		if (message.author.bot) return
		if (
			str.match(
				/nig|neg|nag|nég|nezg|nlg|n1g|ggr0|ni2|n!g|n?g|n*g|ngg|n¡g|niq/gim
			)
		) {
			await message.delete()
		}
	}
}

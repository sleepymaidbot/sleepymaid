import { Message } from 'discord.js'

const blacklistRegex = /nig|neg|nag|nég|nezg|nlg|n1g|ggr0|ni2|n!g|ngg|n¡g|niq/gim
const whitelistRegex = /negatif|négatif/gim

module.exports = {
	name: 'messageCreate',
	once: false,

	async execute(message: Message) {
		if (message.author.id === '324281236728053760') return
		if (message.guild.id !== '324284116021542922') return
		if (message.author.bot) return
		const str = message.content.replace(/ /g, '')
		str.replace(/‎ /g, '')
		const wordArray = message.content.split(' ')
		let infractions = 0
		wordArray.forEach((word) => {
			if (word.match(blacklistRegex)) {
				if (word.match(whitelistRegex)) return
				infractions = infractions + 1
			}
		})
		if (str.match(blacklistRegex)) infractions = infractions + 1
		if (infractions >= 1) {
			await message.delete()
			await message.member.timeout(60 * 1000, 'Triggered word filter')
		}
	}
}

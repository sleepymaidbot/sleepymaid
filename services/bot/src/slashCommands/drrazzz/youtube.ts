import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	guildIds: ['818313526720462868'],
	data: new SlashCommandBuilder()
		.setName('youtube')
		.setDescription('Montre le lien de la chaine youtube de DrraZz_.')
		.toJSON(),

	async execute(interaction) {
		await interaction.reply({
			content:
				'<:youtube:818473733785649183> <[Clique ici pour avoir le lien de la chaine youtube de DrraZz_](https://www.youtube.com/channel/UC-bGc-EQVsAshuL4f4TupeQ)>'
		})
	}
}

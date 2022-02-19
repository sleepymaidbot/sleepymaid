import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	guildIds: ['818313526720462868'],
	data: new SlashCommandBuilder()
		.setName('twitch')
		.setDescription('Montre le lien de la chaine twitch de DrraZz_.')
		.toJSON(),

	async execute(interaction) {
		await interaction.reply({
			content:
				'<:twitch:818473720288378980> <[Clique ici pour avoir le lien de la chaine twitch de DrraZz_](https://www.twitch.tv/drrazz_)>'
		})
	}
}

import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	guildIds: ['324284116021542922'],
	data: new SlashCommandBuilder()
		.setName('tgtommy')
		.setDescription('Faire fermer la geule du timothé du québec.')
		.toJSON(),

	async execute(interaction) {
		interaction.reply('tg <@318029017154322433>')
	}
}

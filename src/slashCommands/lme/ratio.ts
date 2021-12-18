import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	guildIDs: ['324284116021542922', '860721584373497887'],
	data: new SlashCommandBuilder()
		.setName('ratio')
		.setDescription('Rationalise une personne')
		.addUserOption((option) =>
			option.setName('user').setDescription('The user').setRequired(true)
		)
		.toJSON(),

	async execute(interaction) {
		const user = interaction.options.get('user')
		interaction.reply(
			`Ratio à <@${user.value}> par <@${interaction.member.id}>.`
		)
	}
}

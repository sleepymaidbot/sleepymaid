import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('fuckgenshin')
		.setDescription('Fuck genshin'),

	async execute(interaction) {
		await interaction.reply({
			content: 'true',
			ephemeral: true
		})

		await interaction.channel.send({
			content: '<@&851958560413319179>'
		})
	}
}

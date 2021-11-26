import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	guildIDs: ['324284116021542922'],
	data: new SlashCommandBuilder()
		.setName('fuckgenshin')
		.setDescription('Fuck genshin')
		.toJSON(),

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

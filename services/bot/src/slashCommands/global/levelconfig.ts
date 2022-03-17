import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

module.exports = {
	data: new SlashCommandBuilder()
		.setName('config-level')
		.setDescription('Summon a menu to configure your leveling system')
		.toJSON(),

	async execute(interaction: CommandInteraction) {
		await interaction.reply('This command is not implemented yet.')
	}
}

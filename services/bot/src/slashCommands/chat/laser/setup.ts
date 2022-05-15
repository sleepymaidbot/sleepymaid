import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder
} from '@discordjs/builders'
import { SlashCommand } from '@sleepymaid/handler'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle
} from 'discord.js'
import { BotClient } from '../../../lib/extensions/BotClient'

const roles = {
	'975507132306821130': 'Quebec Murder',
	'975507024051839066': 'Doki Doki',
	'975507065327988767': 'Murders Arena'
}

export default new SlashCommand(
	{
		guildIds: ['860721584373497887'],
		data: {
			name: 'setup',
			description: '[Admin] a command that does command related stuff',
			type: ApplicationCommandType.ChatInput,
			options: [
				{
					name: 'name',
					description: 'The name of the command',
					type: ApplicationCommandOptionType.String,
					required: true
				}
			]
		}
	},
	{
		async run(interaction, client: BotClient) {
			if (interaction.user.id !== '324281236728053760') return
			if (!interaction.inCachedGuild()) return
			const name = interaction.options.get('name')
			switch (name.value) {
				case 'roles': {
					const row = new ActionRowBuilder<ButtonBuilder>()
					for (const [id, name] of Object.entries(roles)) {
						row.addComponents(
							new ButtonBuilder()
								.setCustomId('laser-role-ping:' + id)
								.setLabel(name)
								.setStyle(ButtonStyle.Success)
						)
					}

					const embed = new EmbedBuilder().setTitle(
						'Select the servers you are willing to complete map secrets on!'
					)

					await interaction.reply({
						content: 'yo',
						ephemeral: true
					})
					await interaction.channel.send({
						embeds: [embed],
						components: [row]
					})
				}
			}
		}
	}
)

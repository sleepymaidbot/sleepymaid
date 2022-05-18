import {
	ActionRowBuilder,
	ButtonBuilder,
	EmbedBuilder
} from '@discordjs/builders'
import { SlashCommand } from '@sleepymaid/handler'
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	PermissionFlagsBits
} from 'discord.js'

export default new SlashCommand(
	{
		guildIds: ['860721584373497887'],
		data: {
			name: 'setup',
			description: '[Admin only] Allow you to post pre-made messages.',
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
		async run(interaction) {
			if (!interaction.inCachedGuild()) return
			if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator))
				return
			const name = interaction.options.get('name')
			switch (name.value) {
				case 'roles': {
					const row = new ActionRowBuilder<ButtonBuilder>()
					row.addComponents(
						new ButtonBuilder()
							.setLabel('Manage my roles')
							.setStyle(ButtonStyle.Success)
							.setCustomId('laser-role-ping:manage')
							.setEmoji({
								id: '975870168251113545'
							}),
						new ButtonBuilder()
							.setLabel('Remove all my roles')
							.setStyle(ButtonStyle.Danger)
							.setCustomId('laser-role-ping:removeall')
							.setEmoji({
								id: '948606748334358559'
							})
					)

					const embed = new EmbedBuilder()
						.setTitle('Self-assignable roles')
						.setDescription(
							'With this message you can assign yourself some roles.'
						)
						.addFields({
							name: 'Why ?',
							value:
								'Those roles are use to only get pings when we are doing a specific map secret on a specific server.',
							inline: true
						})
						.addFields({
							name: 'How ?',
							value:
								"Click the button 'Manage my roles' to select the servers you are willing to complete map secrets on! \n Click the button 'Remove all my roles' to remove all your roles.",
							inline: true
						})

					await interaction.channel.send({
						embeds: [embed],
						components: [row]
					})
					await interaction.reply({
						content: 'Sent',
						ephemeral: true
					})
					break
				}
			}
		}
	}
)

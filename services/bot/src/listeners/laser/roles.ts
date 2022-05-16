import { Listener } from '@sleepymaid/handler'
import { ButtonInteraction } from 'discord.js'

export default new Listener(
	{
		name: 'interactionCreate',
		once: false
	},
	{
		async run(interaction: ButtonInteraction) {
			if (!interaction.inCachedGuild()) return
			if (!interaction.isButton()) return
			if (interaction.guild.id !== '860721584373497887') return
			if (!interaction.customId.startsWith('laser-role-ping:')) return
			await interaction.deferReply({ ephemeral: true })
			const roleId = interaction.customId.split(':')[1]
			const role = interaction.guild.roles.cache.get(roleId)
			if (!role) return
			if (interaction.member.roles.cache.has(role.id)) {
				interaction.member.roles.remove(role)
				return interaction.editReply({
					content: 'Removed role'
				})
			} else {
				interaction.member.roles.add(role)
				return interaction.editReply({
					content: 'Added role'
				})
			}
		}
	}
)

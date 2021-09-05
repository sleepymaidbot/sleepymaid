import { MessageEmbed } from 'discord.js'

module.exports = {
	name: 'interactionCreate',
	once: false,

	async execute(interaction, client) {
		try {
			const userRole = await interaction.member.roles.cache.map((r) => r.id)
			if (
				interaction.isButton() &&
				interaction.guild.id === '324284116021542922'
			) {
				if (interaction.customId === 'acces_role') {
					if (userRole.includes('884149070757769227')) interaction.deferUpdate()
					else {
						const role = await interaction.guild.roles.cache.find(
							(r) => r.id === '884149070757769227'
						)
						await interaction.member.roles.add(role)
						await interaction.deferUpdate()
					}
				}
			} else if (
				interaction.isSelectMenu() &&
				interaction.guild.id === '324284116021542922'
			) {
				if (interaction.customId === 'ping_role_selects') {
					await interaction.deferUpdate()
					const oldRoles = []
					const newRoles = await interaction.values
					userRole.forEach(async (role) => {
						if (
							role === '879465272669528098' ||
							role === '879465303795466240' ||
							role === '879465436922642462'
						) {
							await oldRoles.push(role)
						}
					})

					const roleRemoved = []
					const roleAdded = []

					oldRoles.forEach(async (role) => {
						if (newRoles.includes(role)) return
						else {
							const oldRole = interaction.guild.roles.cache.find(
								(r) => r.id === role
							)
							await roleRemoved.push(role)
							await interaction.member.roles.remove(oldRole)
						}
					})
					newRoles.forEach(async (role) => {
						if (oldRoles.includes(role)) return
						else {
							const newRole = await interaction.guild.roles.cache.find(
								(r) => r.id === role
							)
							await roleAdded.push(role)
							await interaction.member.roles.add(newRole)
						}
					})

					const embed = new MessageEmbed()
						.setTitle('Rôles modifiés')
						.setColor('#36393f')
						.setTimestamp()

					if (roleAdded.length !== 0) {
						await embed.addField('Rôles ajoutés', `${roleAdded.join('\n')} `)
					}
					if (roleRemoved.length !== 0) {
						await embed.addField(
							'Rôles supprimés',
							`${roleRemoved.join('\n')} `
						)
					}
					if (roleAdded.length !== 0 && roleRemoved.length !== 0) {
						await interaction.editReply({
							embeds: [embed],
							ephemeral: true
						})
					}
				}
			}
		} catch (error) {
			client.logger.error(error)
		}
	}
}

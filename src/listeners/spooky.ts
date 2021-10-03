module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
		if (interaction.customId == 'spooky') {
			if (!interaction.member.roles.cache.has('894308407069274163')) {
				await interaction.deferUpdate()
				const role = interaction.guild.roles.cache.find(
					(r) => r.id === '894308407069274163'
				)
				await interaction.member.roles.add(role)
			} else {
				await interaction.deferUpdate()
			}
		}
	}
}

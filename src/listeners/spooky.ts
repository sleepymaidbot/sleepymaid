module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
		if (interaction.customId == 'spooky') {
            const role = await interaction.guild.roles.cache.find(
                (r) => r.id === '894308407069274163'
            )
			if (interaction.member.roles.cache.has('894308407069274163')) {
				await interaction.deferUpdate()
				await interaction.member.roles.remove(role)
			} else {
				await interaction.deferUpdate()
                await interaction.member.roles.add(role)
			}
		}
	}
}

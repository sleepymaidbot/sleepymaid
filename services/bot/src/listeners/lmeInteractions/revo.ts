module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
		if (interaction.guild.id !== '324284116021542922') return
		if (!interaction.isButton()) return
		if (interaction.customId !== 'revo:join') return
		if (
			interaction.member.roles.cache
				.map((r) => r.id)
				.includes('941123752350077028')
		)
			return await interaction.deferUpdate()
		if (
			interaction.member.roles.cache
				.map((r) => r.id)
				.includes('880946790327799889')
		)
			return await interaction.deferUpdate()

		const role = await interaction.guild.roles.cache.get('941123752350077028')
		await interaction.member.roles.add(role)
		await interaction.reply({
			content: 'Tu a rejoint la révolution!',
			ephemeral: true
		})
	}
}

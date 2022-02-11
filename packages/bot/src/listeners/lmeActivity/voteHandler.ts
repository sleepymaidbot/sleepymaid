module.exports = {
	name: 'interactionCreate',
	once: false,

	async execute(interaction, client) {
		if (interaction.isSelectMenu()) {
			if (
				interaction.channel.id === '775820100917526548' &&
				interaction.guild.id === '324284116021542922' &&
				interaction.customId === 'vote'
			) {
				const value = interaction.values[0]
				const inDb = await client.prisma.mondecorte.findUnique({
					where: {
						id: interaction.member.id
					}
				})
				if (inDb) {
					if (inDb.vote === null) {
						if (interaction.member.id === value) {
							interaction.reply({
								content: 'Tu ne peut pas voter pour toi-même',
								ephemeral: true
							})
						} else {
							await client.prisma.mondecorte.update({
								where: {
									id: interaction.member.id
								},
								data: {
									vote: value
								}
							})
							await interaction.reply({
								content: `Vous avez voté pour <@${value}>`,
								ephemeral: true
							})
						}
					} else {
						interaction.reply({
							content: 'Tu a déja voté.',
							ephemeral: true
						})
					}
				} else {
					interaction.reply({
						content: "Tu n'es pas assez actif pour voter.",
						ephemeral: true
					})
				}
			}
		}
	}
}

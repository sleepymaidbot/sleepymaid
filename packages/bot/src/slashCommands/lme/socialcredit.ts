import { SlashCommandBuilder } from '@discordjs/builders'

module.exports = {
	guildIds: ['324284116021542922'],
	data: new SlashCommandBuilder()
		.setName('socialcredit')
		.setDescription('Affiche le nombre de points socials de la personne')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('add')
				.setDescription('Ajoute des points socials à la personne')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription("L'utilisateur à qui ajouter des points socials")
						.setRequired(true)
				)
				.addNumberOption((option) =>
					option.setName('points').setDescription('Number').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('remove')
				.setDescription('Retire des points socials à la personne')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription("L'utilisateur à qui ajouter des points socials")
						.setRequired(true)
				)
				.addNumberOption((option) =>
					option.setName('points').setDescription('Number').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('set')
				.setDescription('Change le nombre de points socials de la personne')
				.addUserOption((option) =>
					option
						.setName('user')
						.setDescription("L'utilisateur à qui ajouter des points socials")
						.setRequired(true)
				)
				.addNumberOption((option) =>
					option.setName('points').setDescription('Number').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('view')
				.setDescription('Affiche le nombre de points socials de la personne')
				.addUserOption((option) =>
					option.setName('user').setDescription('User').setRequired(false)
				)
		)
		.toJSON(),

	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true })
		const subcommand = interaction.options.getSubcommand()
		switch (subcommand) {
			case 'add': {
				if (interaction.member.roles.cache.has('880946790327799889')) {
					const add = interaction.options.getNumber('points')
					const user = interaction.options.get('user')
					const userInDb = await client.prisma.mondecorte.findUnique({
						where: { id: user.value }
					})
					if (userInDb.socialcredit) {
						const newPoints = userInDb.socialcredit + add
						await client.prisma.mondecorte.update({
							where: { id: user.value },
							data: { socialcredit: newPoints }
						})
						await interaction.editReply(
							`<@${user.value}> a maintenant ${
								userInDb.socialcredit + add
							} points socials`
						)
					} else {
						const newPoints = (userInDb.socialcredit = 500 + add)
						await client.prisma.mondecorte.update({
							where: { id: user.value },
							data: { socialcredit: newPoints }
						})
						await interaction.editReply(
							`<@${user.value}> a maintenant ${userInDb.socialcredit} points socials`
						)
					}
				} else {
					await interaction.editReply(
						"Vous n'avez pas les permissions pour utiliser cette commande"
					)
				}
				break
			}
			case 'remove': {
				if (interaction.member.roles.cache.has('880946790327799889')) {
					const remove = interaction.options.getNumber('points')
					const user = interaction.options.get('user')
					const userInDb = await client.prisma.mondecorte.findUnique({
						where: { id: user.value }
					})
					if (userInDb.socialcredit) {
						const newPoints = userInDb.socialcredit - remove
						await client.prisma.mondecorte.update({
							where: { id: user.value },
							data: { socialcredit: newPoints }
						})
						await interaction.editReply(
							`<@${user.value}> a maintenant ${userInDb.socialcredit} points socials`
						)
					} else {
						const newPoints = 500 - remove
						await client.prisma.mondecorte.update({
							where: { id: user.value },
							data: { socialcredit: newPoints }
						})
						await interaction.editReply(
							`<@${user.value}> a maintenant ${userInDb.socialcredit} points socials`
						)
					}
				} else {
					await interaction.editReply(
						"Vous n'avez pas les permissions pour utiliser cette commande"
					)
				}

				break
			}
			case 'set': {
				if (interaction.member.roles.cache.has('880946790327799889')) {
					const set = interaction.options.getNumber('points')
					const user = interaction.options.get('user')
					const userInDb = await client.prisma.mondecorte.findUnique({
						where: { id: user.value }
					})
					if (userInDb.socialcredit) {
						const newPoints = set
						await client.prisma.mondecorte.update({
							where: { id: user.value },
							data: { socialcredit: newPoints }
						})
						await interaction.editReply(
							`<@${user.value}> a maintenant ${set} points socials`
						)
					} else {
						const newPoints = set
						await client.prisma.mondecorte.update({
							where: { id: user.value },
							data: { socialcredit: newPoints }
						})
						await interaction.editReply(
							`<@${user.value}> a maintenant ${set} points socials`
						)
					}
				} else {
					await interaction.editReply(
						"Vous n'avez pas les permissions pour utiliser cette commande"
					)
				}

				break
			}
			case 'view': {
				const user = interaction.options.get('user')
				const userInDb = await client.prisma.mondecorte.findUnique({
					where: { id: user.value }
				})
				if (userInDb.socialcredit) {
					await interaction.editReply(
						`<@${user.value}> a ${userInDb.socialcredit} points socials`
					)
				} else {
					await client.prisma.mondecorte.update({
						where: { id: user.value },
						data: { socialcredit: 500 }
					})
					await interaction.editReply(`<@${user.value}> a 500 points socials`)
				}
				break
			}
		}
	}
}

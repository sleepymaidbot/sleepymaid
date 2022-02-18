import { SlashCommandBuilder, Embed } from '@discordjs/builders'
import { getCRoleEligibility } from '../../functions/customrole'
import { Util } from 'discord.js'

module.exports = {
	guildIds: ['324284116021542922'],
	data: new SlashCommandBuilder()
		.setName('customrole')
		.setDescription('Manage your custom role')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('create')
				.setDescription('Create your custom role')
				.addStringOption((option) =>
					option
						.setName('name')
						.setDescription('The name of your role')
						.setRequired(true)
				)
				.addStringOption((option) =>
					option
						.setName('color')
						.setDescription('The color of your role')
						.setRequired(false)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('delete').setDescription('Delete your custom role')
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('name')
				.setDescription('Change your custom role name')
				.addStringOption((option) =>
					option
						.setName('name')
						.setDescription('The new name of your role')
						.setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('color')
				.setDescription('Change your custom role color')
				.addStringOption((option) =>
					option
						.setName('color')
						.setDescription('The new color of your role')
						.setRequired(true)
				)
		)
		.toJSON(),

	async execute(interaction, client) {
		await interaction.deferReply({ ephemeral: true })
		const subcommand = interaction.options.getSubcommand()
		const inDb = client.prisma.mondecorte.findUnique({
			where: {
				user_id: interaction.member.id
			}
		})
		const isEligible = await getCRoleEligibility(
			interaction.member,
			inDb?.points || 0
		)
		const customRoleId = inDb?.custom_role_id
		const embed = new Embed()
			.setAuthor({
				name: `Rôle custom de ${interaction.member.user.tag}`,
				iconURL: interaction.member.user.avatarURL()
			})
			.setColor(Util.resolveColor('#36393f'))
			.setTimestamp()
		switch (subcommand) {
			case 'create': {
				const name = await interaction.options.getString('name')
				const color = await interaction.options.getString('color')
				if (isEligible) {
					if (customRoleId !== null || undefined) {
						try {
							const cr = interaction.guild.roles.cache.find(
								(role) => role.id === customRoleId
							)
							await interaction.member.roles.add(cr)
							embed.setDescription('Tu a déja un rôle custom')
							await interaction.editReply({ embeds: [embed], ephemeral: true })
						} catch (e) {
							client.logger.info(e)
						}
					} else {
						const sleepyRole = interaction.guild.roles.cache.find(
							(role) => role.id === '811285873458544680'
						)
						const checkRole = interaction.guild.roles.fetch(name)
						if (checkRole === undefined) {
							embed.setDescription('Se rôle existe déja.')
							return await interaction.editReply({
								embeds: [embed],
								ephemeral: true
							})
						}
						const pos = sleepyRole.position - 1
						await interaction.guild.roles
							.create({
								name: name,
								color: color,
								position: pos,
								reason: `Custom role created by ${interaction.member.user.tag} (${interaction.member.id})`
							})
							.then(async (role) => {
								interaction.member.roles.add(role)
								await client.prisma.mondecorte
									.update({
										data: {
											crole: role.id
										},
										where: {
											id: interaction.member.id
										}
									})
									.then(async () => {
										embed.setDescription(`Ton rôle custom a été créer <@&${role.id}>.
									Pour modifier le nom fait la commande  \`\`/customrole name <name>\`\`
									Pour modifier la couleur fait la commande \`\`/customrole color <color>\`\``)
										await interaction.editReply({
											embeds: [embed],
											ephemeral: true
										})
									})
							})
							.catch(console.error)
					}
				} else {
					embed.setDescription("Tu n'est pas élibible.")
					await interaction.editReply({ embeds: [embed], ephemeral: true })
				}
				break
			}
			case 'delete': {
				if (customRoleId) {
					try {
						const crole = interaction.guild.roles.cache.find(
							(role) => role.id === customRoleId
						)
						await crole.delete()
						await client.prisma.mondecorte
							.update({
								data: {
									crole: null
								},
								where: {
									id: interaction.member.id
								}
							})
							.then(async () => {
								embed.setDescription('Ton rôle custom a été supprimer')
								await interaction.editReply({
									embeds: [embed],
									ephemeral: true
								})
							})
					} catch (e) {
						client.logger.info(e)
					}
				} else {
					embed.setDescription("Tu n'as pas de rôle custom")
					await interaction.editReply({ embeds: [embed], ephemeral: true })
				}
				break
			}
			case 'name': {
				const name = interaction.options.getString('name')
				if (customRoleId && isEligible) {
					const crole = interaction.guild.roles.cache.find(
						(role) => role.id === customRoleId
					)
					crole
						.setName(name)
						.then(async (updated) => {
							embed.setDescription(
								`Le nom de ton rôle custom a été changer pour #${name} (<@&${updated.id}>)`
							)
							await interaction.editReply({ embeds: [embed], ephemeral: true })
						})
						.catch(console.error)
				} else {
					embed.setDescription("Tu n'as pas de rôle custom")
					await interaction.editReply({ embeds: [embed], ephemeral: true })
				}
				break
			}
			case 'color': {
				const color = interaction.options.getString('color')
				if (customRoleId && isEligible) {
					const crole = interaction.guild.roles.cache.find(
						(role) => role.id === customRoleId
					)
					crole
						.setColor(color)
						.then(async (updated) => {
							embed.setDescription(
								`La couleur de ton rôle custom a été changer pour #${color} (<@&${updated.id}>)`
							)
							await interaction.editReply({ embeds: [embed], ephemeral: true })
						})
						.catch(console.error)
				} else {
					embed.setDescription("Tu n'as pas de rôle custom")
					await interaction.editReply({ embeds: [embed], ephemeral: true })
				}
				break
			}
		}
	}
}
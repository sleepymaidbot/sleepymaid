import { SlashCommandBuilder } from '@discordjs/builders'
import { Message } from 'discord.js'
import { mondecorteModel } from '../../lib/utils/db'

module.exports = {
	guildIDs: ['324284116021542922'],
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

	async execute(interaction) {
		await interaction.deferReply({ ephemeral: true })
		const subcommand = interaction.options.getSubcommand()
		switch (subcommand) {
			case 'add': {
				if (interaction.member.roles.cache.has('880946790327799889')) {
					const add = interaction.options.getNumber('points')
					const user = interaction.options.get('user')
					const userInDB = await mondecorteModel.findOne({ id: user.value })
					if (userInDB.socialcredit) {
						userInDB.socialcredit = userInDB.socialcredit + add
						await userInDB.save()
						await interaction.editReply(
							`<@${user.value}> a maintenant ${
								userInDB.socialcredit + add
							} points socials`
						)
					} else {
						userInDB.socialcredit = 500 + add
						await userInDB.save()
						await interaction.editReply(
							`<@${user.value}> a maintenant ${userInDB.socialcredit} points socials`
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
					const userInDB = await mondecorteModel.findOne({ id: user.value })
					if (userInDB.socialcredit) {
						userInDB.socialcredit = userInDB.socialcredit - remove
						await userInDB.save()
						await interaction.editReply(
							`<@${user.value}> a maintenant ${userInDB.socialcredit} points socials`
						)
					} else {
						userInDB.socialcredit = 500 - remove
						await userInDB.save()
						await interaction.editReply(
							`<@${user.value}> a maintenant ${userInDB.socialcredit} points socials`
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
					const userInDB = await mondecorteModel.findOne({ id: user.value })
					if (userInDB.socialcredit) {
						userInDB.socialcredit = set
						await userInDB.save()
						await interaction.editReply(
							`<@${user.value}> a maintenant ${set} points socials`
						)
					} else {
						userInDB.socialcredit = set
						await userInDB.save()
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
				const userInDB = await mondecorteModel.findOne({ id: user.value })
				if (userInDB.socialcredit) {
					await interaction.editReply(
						`<@${user.value}> a ${userInDB.socialcredit} points socials`
					)
				} else {
					userInDB.socialcredit = 500
					await interaction.editReply(`<@${user.value}> a 500 points socials`)
				}
				break
			}
		}
	}
}

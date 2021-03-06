import { SlashCommandBuilder, EmbedBuilder } from '@discordjs/builders'
import { Result } from '@sapphire/result'
import { SlashCommandInterface } from '@sleepymaid/handler'
import {
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	ColorResolvable,
	resolveColor
} from 'discord.js'
import { BotClient } from '../../../lib/extensions/BotClient'

export default class CustomRoleCommand implements SlashCommandInterface {
	public readonly guildIds = ['324284116021542922']
	public readonly data = new SlashCommandBuilder()
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
		.toJSON() as ChatInputApplicationCommandData

	public async execute(
		interaction: ChatInputCommandInteraction,
		client: BotClient
	) {
		if (!interaction.inCachedGuild()) return
		await interaction.deferReply({ ephemeral: true })
		const subcommand = interaction.options.getSubcommand()
		const inDb = await client.prisma.mondecorte.findUnique({
			where: {
				user_id: interaction.user.id
			}
		})
		const isEligible = (member, points) => {
			const userrole = member.roles.cache.map((x) => x.id)
			if (userrole.includes('869637334126170112')) return true
			if (points >= 250) return true
		}

		const customRoleId = inDb?.custom_role_id
		const embed = new EmbedBuilder()
			.setAuthor({
				name: `R??le custom de ${interaction.user.tag}`,
				iconURL: interaction.user.avatarURL()
			})
			.setColor(resolveColor('#36393f'))
			.setTimestamp()
		switch (subcommand) {
			case 'create': {
				const name = await interaction.options.getString('name')
				const color = (await interaction.options.getString(
					'color'
				)) as ColorResolvable
				if (isEligible(interaction.member, inDb?.points)) {
					if (customRoleId !== null || undefined) {
						try {
							const roleReturn = await Result.fromAsync(async () => {
								const role = interaction.guild.roles.cache.find(
									(role) => role.id === customRoleId
								)
								await interaction.member.roles.add(role)
							})
							if (roleReturn.isErr()) {
								await client.prisma.mondecorte.update({
									where: { user_id: interaction.user.id },
									data: {
										custom_role_id: null
									}
								})
								embed.setDescription('Ton r??le custom a ??t?? supprim??')
								return await interaction.editReply({
									embeds: [embed]
								})
							}
							embed.setDescription('Tu a d??ja un r??le custom')
							await interaction.editReply({
								embeds: [embed]
							})
						} catch (e) {
							client.logger.error(e)
						}
					} else {
						const sleepyRole = interaction.guild.roles.cache.find(
							(role) => role.id === '811285873458544680'
						)
						const checkRole = interaction.guild.roles.fetch(name)
						if (checkRole === undefined) {
							embed.setDescription('Se r??le existe d??ja.')
							return await interaction.editReply({
								embeds: [embed]
							})
						}
						const pos = sleepyRole.position - 1
						await interaction.guild.roles
							.create({
								name: name,
								color: resolveColor(color),
								position: pos,
								reason: `Custom role created by ${interaction.member.user.tag} (${interaction.member.id})`
							})
							.then(async (role) => {
								interaction.member.roles.add(role)
								await client.prisma.mondecorte
									.update({
										data: {
											custom_role_id: role.id
										},
										where: {
											user_id: interaction.member.id
										}
									})
									.then(async () => {
										embed.setDescription(`Ton r??le custom a ??t?? cr??er <@&${role.id}>.
									Pour modifier le nom fait la commande  \`\`/customrole name <name>\`\`
									Pour modifier la couleur fait la commande \`\`/customrole color <color>\`\``)
										await interaction.editReply({
											embeds: [embed]
										})
									})
							})
							.catch(client.logger.error)
					}
				} else {
					embed.setDescription("Tu n'est pas ??ligible.")
					await interaction.editReply({ embeds: [embed] })
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
									custom_role_id: null
								},
								where: {
									user_id: interaction.member.id
								}
							})
							.then(async () => {
								embed.setDescription('Ton r??le custom a ??t?? supprimer')
								await interaction.editReply({
									embeds: [embed]
								})
							})
					} catch (e) {
						client.logger.error(e)
					}
				} else {
					embed.setDescription("Tu n'as pas de r??le custom")
					await interaction.editReply({ embeds: [embed] })
				}
				break
			}
			case 'name': {
				const name = interaction.options.getString('name')
				if (customRoleId && isEligible(interaction.member, inDb?.points)) {
					const crole = interaction.guild.roles.cache.find(
						(role) => role.id === customRoleId
					)
					crole
						.setName(name)
						.then(async (updated) => {
							embed.setDescription(
								`Le nom de ton r??le custom a ??t?? changer pour #${name} (<@&${updated.id}>)`
							)
							await interaction.editReply({
								embeds: [embed]
							})
						})
						.catch(client.logger.error)
				} else {
					embed.setDescription("Tu n'as pas de r??le custom")
					await interaction.editReply({ embeds: [embed] })
				}
				break
			}
			case 'color': {
				const color = interaction.options.getString('color') as ColorResolvable
				if (customRoleId && isEligible(interaction.member, inDb?.points)) {
					const crole = interaction.guild.roles.cache.find(
						(role) => role.id === customRoleId
					)
					crole
						.setColor(resolveColor(color))
						.then(async (updated) => {
							embed.setDescription(
								`La couleur de ton r??le custom a ??t?? changer pour #${color} (<@&${updated.id}>)`
							)
							await interaction.editReply({
								embeds: [embed]
							})
						})
						.catch(client.logger.error)
				} else {
					embed.setDescription("Tu n'as pas de r??le custom")
					await interaction.editReply({ embeds: [embed] })
				}
				break
			}
		}
	}
}

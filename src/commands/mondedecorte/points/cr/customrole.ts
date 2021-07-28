import { Message, MessageEmbed } from 'discord.js'
import { checkUserActivityPoints } from '../../../../functions/actifrole'
import { BotCommand } from '../../../../lib/extensions/BotCommand'
import { getUserCustomRoleId } from '../../../../functions/customrole'
import { customRoleModel } from '../../../../lib/utils/db'
import { config } from '../../../../config/config'

export default class customRole extends BotCommand {
	constructor() {
		super('customrole', {
			aliases: ['customrole', 'cr'],
			args: [
				{
					id: 'action',
					type: [
						['create', 'c'],
						['delete', 'd'],
						['name', 'n'],
						['color', 'couleur', 'co']
					]
				},
				{
					id: 'result',
					match: 'rest'
				}
			],
			channel: 'guild'
		})
	}

	async exec(message: Message, args) {
		const action = args.action
		const embed = new MessageEmbed()
			.setAuthor(
				`Rôle custom de ${message.author.tag}`,
				message.author.avatarURL()
			)
			.setColor('#36393f')
			.setTimestamp()

		const userCrId = await getUserCustomRoleId(message.member)
		const userPoints = await checkUserActivityPoints(message.member)

		if (action == 'create') {
			if (userPoints >= 250) {
				if (userCrId) {
					const cr = message.guild.roles.cache.find(
						(role) => role.id === userCrId
					)
					await message.member.roles.add(cr)
					embed.setDescription('Tu a déja un rôle custom')
					message.reply({ embeds: [embed] })
				} else {
					if (args.result) {
						await message.guild.roles
							.create({
								name: args.result,
								reason: `Custom role created by ${message.author.tag} (${message.author.id})`
							})
							.then(async (role) => {
								message.member.roles.add(role)
								const newRoleDb = new customRoleModel({
									id: message.author.id,
									role: role.id
								})
								await newRoleDb.save()
								embed.setDescription(`Ton rôle custom a été créer <@&${role.id}>.
                                Pour modifier le nom fait la commande  \`\`${config.prefix}cr name <name>\`\`
                                Pour modifier la couleur fait la commande \`\`${config.prefix}cr color <color>\`\``)
								await message.reply({ embeds: [embed] })
							})
							.catch(console.error)
					} else {
						embed.setDescription('Tu doit spécifier le nom de ton rôle')
						message.reply({ embeds: [embed] })
					}
				}
			} else {
				embed.setDescription("Tu n'a pas assez de points.")
				await message.reply({ embeds: [embed] })
			}
		} else if (action === 'delete') {
			if (userCrId) {
				const crole = message.guild.roles.cache.find(
					(role) => role.id === userCrId
				)
				await crole.delete()
				await customRoleModel
					.deleteOne({ id: message.author.id })
					.catch(console.error)
				embed.setDescription('Ton rôle custom a été supprimer')
				await message.reply({ embeds: [embed] })
			}
		} else if (action === 'color') {
			if (userCrId && userPoints >= 250) {
				const crole = message.guild.roles.cache.find(
					(role) => role.id === userCrId
				)
				crole
					.setColor(args.result)
					.then(async (updated) => {
						embed.setDescription(
							`La couleur de ton rôle custom a été changer pour #${args.result} (<@&${updated.id}>)`
						)
						await message.reply({ embeds: [embed] })
					})
					.catch(console.error)
			}
		} else if (action === 'name') {
			if (userCrId && userPoints >= 250) {
				const crole = message.guild.roles.cache.find(
					(role) => role.id === userCrId
				)
				crole
					.setName(args.result)
					.then(async (updated) => {
						embed.setDescription(
							`La nom de ton rôle custom a été changer pour \`\`${args.result}\`\` (<@&${updated.id}>)`
						)
						await message.reply({ embeds: [embed] })
					})
					.catch(console.error)
			}
		} else {
			embed.setDescription('Subcommand invalid. ``["create", "delete", "name", "color"]``')
			await message.reply({ embeds: [embed] })
		}
	}
}

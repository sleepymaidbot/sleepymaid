import { Embed, SlashCommandBuilder } from '@discordjs/builders'
import { Util } from 'discord.js'
import { container } from 'tsyringe'
import { roleSyncer } from '../../lib/rolesyncer'
import { BotClient } from '../../lib/BotClient'
import { pointToRemoveForPoints } from '../../lib/lists'
import 'reflect-metadata'

module.exports = {
	guildIds: ['324284116021542922'],
	data: new SlashCommandBuilder()
		.setName('rewards')
		.setDescription('Show my rewards.')
		.toJSON(),

	async execute(interaction, client) {
		await interaction.deferReply()
		const userInDb = await client.prisma.mondecorte.findUnique({
			where: {
				user_id: interaction.member.id
			}
		})
		const points = userInDb?.points || 0
		const embed = new Embed()
			.setColor(Util.resolveColor('#36393f'))
			.setAuthor({
				name: `${interaction.member.user.tag} rewards`,
				iconURL: interaction.member.user.avatarURL()
			})
			.setTimestamp()

		let hasColorful = '❌'
		if (interaction.member.roles.cache.has('857324294791364639'))
			hasColorful = '✅'
		let hasActif = '❌'
		if (interaction.member.roles.cache.has('842387653394563074'))
			hasActif = '✅'
		let hasRegulier = '❌'
		if (interaction.member.roles.cache.has('927331668455469077'))
			hasRegulier = '✅'
		let hasInsomniaque = '❌'
		if (interaction.member.roles.cache.has('927358871939481690'))
			hasInsomniaque = '✅'
		let hasPasDeVie = '❌'
		if (interaction.member.roles.cache.has('927359635709628447'))
			hasPasDeVie = '✅'
		let hasCustomRole = '❌'
		if (points >= 250) {
			const croleid = userInDb?.custom_role_id
			if (croleid != null) {
				if (interaction.member.roles.cache.has(croleid)) {
					hasCustomRole = '✅'
				} else {
					const crole = interaction.guild.roles.cache.find(
						(role) => role.id === croleid
					)
					interaction.member.roles.add(crole).catch(console.error)
				}
			} else {
				hasCustomRole = '🟡'
				embed.addFields({
					name: 'Une récompense non réclamer',
					value:
						'```Tu n\'a pas réclamer ton rôle custom. \nPour le réclamer fait "/customrole create <nom>" \n<nom> étant le nom désiré du rôle.```',
					inline: true
				})
			}
		}
		if (points >= 500) {
			let pointsToLoose = 1
			pointToRemoveForPoints.forEach((e) => {
				if (e.need <= points) pointsToLoose = e.remove
			})

			if (pointsToLoose !== 1) {
				embed.addFields({
					name: 'Perte de points par heures',
					value: `\`\`\`Tu perds ${pointsToLoose} points par heure à cause que tu as ${points} points.\`\`\``,
					inline: true
				})
			}
		}

		container.register(BotClient, { useValue: client })
		await container.resolve(roleSyncer).checkUserRole(interaction.member)

		embed.setDescription(`Voici une liste des récompense que tu a obtenu:
  - Rôle <@&857324294791364639>: ${hasColorful}
  - Rôle <@&869637334126170112>: ${hasCustomRole}
  - Rôle <@&842387653394563074>: ${hasActif}
  - Rôle <@&927331668455469077>: ${hasRegulier}
  - Rôle <@&927358871939481690>: ${hasInsomniaque}
  - Rôle <@&927359635709628447>: ${hasPasDeVie}`)

		await interaction.editReply({ embeds: [embed] })
	}
}

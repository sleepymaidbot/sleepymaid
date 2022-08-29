import { ButtonStyle } from 'discord-api-types/v10'
import {
	ButtonBuilder,
	ActionRowBuilder,
	SelectMenuBuilder,
	SelectMenuOptionBuilder
} from '@discordjs/builders'
import { pingRoleIds, colorRoleIds } from '../../lib/lists'
import { ListenerInterface } from '@sleepymaid/handler'

export default class MetahandlerListener implements ListenerInterface {
	public readonly name = 'interactionCreate'
	public readonly once = false

	public async execute(interaction) {
		if (!interaction.customId?.startsWith('lmeMeta')) return
		if (!interaction.inCachedGuild()) return
		const Ids = interaction.customId.split(':')
		if (Ids[0] !== 'lmeMeta') return
		await interaction.deferReply({ ephemeral: true })
		if (Ids[1] === 'bienvenue') {
			if (Ids[2] === 'init') {
				switch (Ids[3]) {
					case 'ping': {
						const pingOptions = [
							{
								label: 'Annonce',
								description: 'Notification pour les annonces importantes',
								emoji: { name: '📢' },
								value: '879465272669528098'
							},
							{
								label: 'Free Stuff',
								description: 'Notification pour quand un jeux deviens gratuit',
								emoji: { name: '🎮' },
								value: '879465303795466240'
							},
							{
								label: 'Giveaway',
								description: 'Notification pour quand il y a un giveaway',
								emoji: { name: '🎉' },
								value: '879465436922642462'
							}
						]
						const row1 =
							new ActionRowBuilder<SelectMenuBuilder>().addComponents([
								new SelectMenuBuilder()
									.setCustomId('lmeMeta:bienvenue:select:ping')
									.setPlaceholder('Choisis ici tes rôles de notification')
									.setMaxValues(3)
									.setMinValues(0)
									.addOptions(
										pingOptions.map(
											(option) => new SelectMenuOptionBuilder(option)
										)
									)
							])

						const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents([
							new ButtonBuilder()
								.setLabel('Supprimer mes notifications')
								.setCustomId('lmeMeta:bienvenue:delete:ping')
								.setEmoji({ id: '948606748334358559' })
								.setStyle(ButtonStyle.Secondary)
						])

						await interaction.editReply({
							content:
								'Sélectionnez ci-dessous les notifications que vous souhaitez recevoir.',
							components: [row1, row2]
						})
						break
					}
					case 'color': {
						if (interaction.member.roles.cache.has('857324294791364639')) {
							const colorOptions = [
								{
									label: 'Maya',
									value: '857372101748719656'
								},
								{
									label: 'Mikado',
									value: '857372291855679538'
								},
								{
									label: 'Rose',
									value: '857372400440967198'
								},
								{
									label: 'Lavender',
									value: '857372585552773120'
								},
								{
									label: 'Coral',
									value: '857372666141736981'
								},
								{
									label: 'Cantaloupe',
									value: '857372789139963925'
								},
								{
									label: 'Mint',
									value: '857372929598947368'
								},
								{
									label: 'Weed',
									value: '857431586202189835'
								},
								{
									label: 'Smoked',
									value: '857432207534981151'
								}
							]
							const row1 = new ActionRowBuilder().addComponents([
								new SelectMenuBuilder()
									.setCustomId('lmeMeta:bienvenue:select:color')
									.setPlaceholder('Choisis ici ton rôle de couleur')
									.addOptions(
										colorOptions.map(
											(options) => new SelectMenuOptionBuilder(options)
										)
									)
							])

							const row2 = new ActionRowBuilder().addComponents([
								new ButtonBuilder()
									.setLabel('Supprimer ma couleur')
									.setCustomId('lmeMeta:bienvenue:delete:color')
									.setEmoji({ id: '948606748334358559' })
									.setStyle(ButtonStyle.Secondary)
							])

							await interaction.editReply({
								content: 'Sélectionnez ci-dessous un rôle de couleur.',
								components: [row1, row2]
							})
						} else {
							await interaction.editReply({
								content:
									"<:redX:948606748334358559> Pour pouvoir bénéficier des **couleurs**, vous devez posséder l'un des **rôles** suivant: ``Nitro Booster``, ``Actif``."
							})
						}
						break
					}
					case 'viewRoles': {
						const pingRole = interaction.member.roles.cache.filter((role) =>
							pingRoleIds.includes(role.id)
						)
						const colorRole = interaction.member.roles.cache.filter((role) =>
							colorRoleIds.includes(role.id)
						)
						let cleanPingRole
						if (pingRole.size > 0) {
							cleanPingRole =
								'**Notifications:**' +
								pingRole.map((role) => '<@&' + role.id + '>').join(', ')
						} else {
							cleanPingRole = '**Notifications:** Aucune'
						}
						let cleanColorRole
						if (colorRole.size > 0) {
							cleanColorRole =
								'**Couleurs:**' +
								colorRole.map((role) => '<@&' + role.id + '>').join(', ')
						} else {
							cleanColorRole = '**Couleurs:** Aucune'
						}
						await interaction.editReply({
							content: cleanPingRole + '\n' + cleanColorRole
						})
						break
					}
				}
			} else if (Ids[2] === 'select') {
				switch (Ids[3]) {
					case 'ping': {
						const currentPingRole = interaction.member.roles.cache
							.filter((role) => pingRoleIds.includes(role.id))
							.map((role) => role.id)
						const newPingRole = interaction.values

						const toAdd = newPingRole.filter(
							(role) => !currentPingRole.includes(role)
						)
						const toRemove = currentPingRole.filter(
							(role) => !newPingRole.includes(role)
						)

						await interaction.member.roles.add(toAdd)
						await interaction.member.roles.remove(toRemove)

						await interaction.editReply({
							content:
								'<:greenTick:948620600144982026> Tes rôles de notifications ont été mis à jour.'
						})
						break
					}
					case 'color': {
						const currentColorRole = interaction.member.roles.cache
							.filter((role) => colorRoleIds.includes(role.id))
							.map((role) => role.id)
						const newColorRole = interaction.values

						const toAdd = newColorRole.filter(
							(role) => !currentColorRole.includes(role)
						)
						const toRemove = currentColorRole.filter(
							(role) => !newColorRole.includes(role)
						)

						await interaction.member.roles.add(toAdd)
						await interaction.member.roles.remove(toRemove)

						await interaction.editReply({
							content:
								'<:greenTick:948620600144982026> Ton rôle de couleur à été mis à jour.'
						})
						break
					}
				}
			} else if (Ids[2] === 'delete') {
				switch (Ids[3]) {
					case 'ping': {
						const currentPingRole = interaction.member.roles.cache
							.filter((role) => pingRoleIds.includes(role.id))
							.map((role) => role.id)
						interaction.member.roles.remove(currentPingRole)
						await interaction.editReply({
							content:
								"<:greenTick:948620600144982026> L'ensemble de tes rôles de notifications ont bien été retirés."
						})
						break
					}
					case 'color': {
						const currentColorRole = interaction.member.roles.cache
							.filter((role) => colorRoleIds.includes(role.id))
							.map((role) => role.id)
						interaction.member.roles.remove(currentColorRole)
						await interaction.editReply({
							content:
								'<:greenTick:948620600144982026> Ton rôle de couleur à bien été retiré.'
						})
						break
					}
				}
			} else if (Ids[2] === 'join') {
				if (
					interaction.member.roles.cache.has('884149070757769227') ||
					interaction.member.roles.cache.has('862462288345694210') ||
					interaction.member.roles.cache.has('403681300940193804')
				)
					await interaction.editReply({
						content: 'Tu es déjà membre.'
					})
				else {
					const role = await interaction.guild.roles.cache.find(
						(r) => r.id === '884149070757769227'
					)
					await interaction.member.roles.add(role)

					await interaction.editReply({
						content: `<:wave:948626464432083014> **__Bienvenue sur le serveur__**`
					})
				}
			}
		}
	}
}

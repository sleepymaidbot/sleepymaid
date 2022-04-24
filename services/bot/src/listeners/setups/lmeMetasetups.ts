import {
	EmbedBuilder,
	ActionRowBuilder,
	ButtonBuilder
} from '@discordjs/builders'
import { ButtonStyle, Util } from 'discord.js'
import { Listener } from '@sleepymaid/handler'

export default new Listener(
	{
		name: 'messageCreate',
		once: false
	},
	{
		async run(message, client) {
			if (message.author.id !== '324281236728053760') return
			const content = message.content.split(' ')
			const cmd = content[0]
			if (!cmd.startsWith(client.config.prefix)) return
			switch (cmd.slice(1)) {
				case 'setupBienvenue': {
					// Message 1
					const embed1 = new EmbedBuilder()
						.setTitle(":otter: Bienvenue sur Le monde d'Ecorte")
						.setDescription(
							'Ce serveur est un serveur entre amis qui vous permet de discuter et de vous divertir.'
						)
						.setColor(Util.resolveColor('#33a34b'))
					const embed2 = new EmbedBuilder()
						.setDescription(
							"Dans ce lieu, vous pourrez bénéficier d'un coin pour parler de tout et de rien ou poster vos meilleur mêmes sans vous prendre la tête même après une journée difficile!\n\n Pour commencer je te conseil de lire les règlements ci-dessous.\n<:blank:948461701420945439>"
						)
						.addFields({
							name: '<:greenDot:948462338594467870> Liens utiles',
							value: '> **Discord:** https://discord.gg/8bpy2PC',
							inline: true
						})
						.addFields({
							name: '<:greenDot:948462338594467870> Crédits',
							value:
								'> Les icônes utiliser sur le serveur sont la propriété de [Icons](https://discord.gg/9AtkECMX2P)',
							inline: true
						})
						.setColor(Util.resolveColor('#36393f'))

					await message.channel.send({
						embeds: [embed1, embed2]
					})

					// Message 2

					const embed3 = new EmbedBuilder()
						.setTitle(':otter: Règlements du Serveur')
						.setDescription(
							'Pour garantir un environnement convivial et sécurisé, nous vous demandons de respecter les règlements ci-dessous sans exception.'
						)
						.setColor(Util.resolveColor('#5765f2'))

					const embed4 = new EmbedBuilder()
						.addFields({
							name: '<:blueDot:948466553505062992> A. Bon sens',
							value:
								'```01. Vous devez respecter les ToS de Discord\n02. Pas de NSFW, politiques ou pub\n03. Le spam ou troll est interdit\n04. Gardez vos drama personnel en MP\n05. Gardez un profil approprié\n06. Traitez les autres avec respect```'
						})
						.addFields({
							name: '<:blueDot:948466553505062992> B. Utilisation du serveur',
							value:
								"```07. Ne demandez pas de rôles, points, etc.\n08. Respectez le sujet de chaque salon\n09. Utiliser ModMail pour parler au staff\n10. Ne donnez pas d'informations personnelles\n11. Ne mentionnez pas sans raison```"
						})
						.addFields({
							name: '<:blueDot:948466553505062992> C. Événements',
							value:
								"```12. Respectez les autres participants\n13. Voler le travail d'autrui est interdit\n14. Lisez bien les instructions d'un évènement avant d'y participer```"
						})
						.setFooter({
							text: 'Cette liste ne contient pas tout ce que vous pouvez / ne pouvez pas faire. Les membres du staff peuvent appliquer les règles de la manière qui leur convient le mieux.'
						})
						.setColor(Util.resolveColor('#36393f'))

					await message.channel.send({
						content: '<:blank:948461701420945439>',
						embeds: [embed3, embed4]
					})

					// Message 3
					const embed5 = new EmbedBuilder()
						.setTitle(':otter: Rôles & Notifications')
						.setColor(Util.resolveColor('#ff9326'))
						.setDescription(
							'Sélectionnez les rôles et notifications qui vous intéressent sur le serveur en cliquant sur les boutons ci-dessous. Si besoin, cliquez sur le bouton **Voir mes Rôles** pour voir la liste de vos rôles.'
						)

					const row1 = new ActionRowBuilder()
						.addComponents(
							new ButtonBuilder()
								.setCustomId('lmeMeta:bienvenue:init:ping')
								.setLabel('Notifications')
								.setStyle(ButtonStyle.Primary)
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('lmeMeta:bienvenue:init:color')
								.setLabel('Couleur')
								.setStyle(ButtonStyle.Primary)
						)
						.addComponents(
							new ButtonBuilder()
								.setCustomId('lmeMeta:bienvenue:init:viewRoles')
								.setLabel('Voir mes rôles')
								.setEmoji({ name: '❔' })
								.setStyle(ButtonStyle.Secondary)
						)

					await message.channel.send({
						content: '<:blank:948461701420945439>',
						embeds: [embed5],
						components: [row1]
					})

					// Message 4
					const embed6 = new EmbedBuilder()
						.setTitle(':otter: Accès au serveur')
						.setColor(Util.resolveColor('#3ba55d'))
						.setDescription(
							'Pour avoir accès au serveur, cliquez sur le bouton ci-dessous.'
						)

					const row2 = new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('lmeMeta:bienvenue:join')
							.setLabel("J'ai lu et j'accepte les règlements")
							.setStyle(ButtonStyle.Success)
							.setEmoji({ name: '✅' })
					)

					await message.channel.send({
						content: '<:blank:948461701420945439>',
						embeds: [embed6],
						components: [row2]
					})
					break
				}
				case 'setupSupport': {
					const embed1 = new EmbedBuilder()
						.setTitle("🎟️ Comment contacter l'Équipe du Staff?")
						.setDescription(
							"Besoin de contacter le staff pour un problème, une question un peu complexe ou autre chose demandant un espace de discussion privé avec l'équipe de modération?"
						)
						.setColor(Util.resolveColor('#33a34b'))
					const embed2 = new EmbedBuilder()
						.setDescription(
							'Alors cliquez sur la réaction 📩 sur se message pour ouvrir un ticket vous permettant de contacter le staff.'
						)
						.setColor(Util.resolveColor('#36393f'))

					await message.channel.send({
						embeds: [embed1, embed2]
					})
				}
			}
		}
	}
)

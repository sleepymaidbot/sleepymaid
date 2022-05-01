import { Listener } from '@sleepymaid/handler'
import { BotClient } from '../../lib/extensions/BotClient'

export default new Listener(
	{
		name: 'interactionCreate',
		once: false
	},
	{
		async run(interaction, client: BotClient) {
			if (interaction.isSelectMenu()) {
				if (
					interaction.channel.id === '945053781240987759' &&
					interaction.guild.id === '324284116021542922' &&
					interaction.customId === 'vote'
				) {
					const value = interaction.values[0]
					const inDb = await client.prisma.mondecorte.findUnique({
						where: {
							user_id: interaction.member.id
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
										user_id: interaction.member.id
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
								content: 'Tu as déja voté.',
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
)

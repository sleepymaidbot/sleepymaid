import { Listener } from 'discord-akairo'
import { mondecorteModel } from '../lib/utils/db'

export default class VoteHandler extends Listener {
	constructor() {
		super('voteHandler', {
			emitter: 'client',
			event: 'interactionCreate'
		})
	}

	async exec(interaction) {
		if (interaction.isSelectMenu()) {
			if (
				//interaction.channel.id === '775820100917526548' &&
				//interaction.guild.id === '324284116021542922' &&
				interaction.customId === 'vote'
			) {
				const value = interaction.values[0]
				const inDb = await mondecorteModel.findOne({
					id: interaction.member.id
				})
				if (inDb) {
					if (inDb.vote === null) {
						if (interaction.member.id === value) {
							interaction.reply({
								content: 'Tu ne peut pas voter pour toi-même',
								ephemeral: true
							})
						} else {
							inDb.vote = value
							await inDb.save()
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

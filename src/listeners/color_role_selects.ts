import { colorRole } from '../config/lists'

module.exports = {
	name: 'interactionCreate',
	once: false,
	async execute(interaction) {
		if (interaction.isSelectMenu()) {
			if (
				interaction.guildId == '324284116021542922' &&
				interaction.customId == 'color_role_selects'
			) {
				const memberRole = interaction.member.roles.cache.map((r) => r.name)
				if (memberRole.includes('Colorful')) {
					const buttonID = interaction.values[0]
					const role = interaction.guild.roles.cache.find(
						(role) => role.name === buttonID
					)
					if (memberRole.includes(buttonID)) {
						interaction.member.roles.remove(role)
					} else {
						if (buttonID === 'nothing') {
							const roleToRemove: string[] = []
							memberRole.forEach((eachRole) => {
								if (colorRole.includes(eachRole)) {
									roleToRemove.push(eachRole)
								}
							})
							roleToRemove.forEach((eachRole) => {
								const rrole = interaction.guild.roles.cache.find(
									(role) => role.name === eachRole
								)
								interaction.member.roles.remove(rrole)
							})
							interaction.reply({
								content: 'Removed all your color role!',
								ephemeral: true
							})
						} else {
							interaction.member.roles.add(role)
							const roleToRemove: string[] = []
							memberRole.forEach((eachRole) => {
								if (eachRole == role.name) {
									return
								} else if (colorRole.includes(eachRole)) {
									roleToRemove.push(eachRole)
								}
							})
							roleToRemove.forEach((eachRole) => {
								const rrole = interaction.guild.roles.cache.find(
									(role) => role.name === eachRole
								)
								interaction.member.roles.remove(rrole)
							})
							interaction.reply({
								content: `Gave the <@&${role.id}> role!`,
								ephemeral: true
							})
						}
					}
				} else interaction.deferUpdate()
			}
		}
	}
}

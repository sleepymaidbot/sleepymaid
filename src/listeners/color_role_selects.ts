import { Listener } from 'discord-akairo'
import { colorRole } from '../config/lists'

export default class ColorRoleSelectsListener extends Listener {
	constructor() {
		super('ColorRoleSelects', {
			emitter: 'client',
			event: 'interactionCreate'
		})
	}

	exec(interaction) {
		if (interaction.isSelectMenu()) {
			if (
				interaction.guildId == '324284116021542922' &&
				interaction.channelId == '857342694691307540'
			) {
				const memberRole: string[] = []
				interaction.member.roles.cache.forEach((role) => {
					memberRole.push(role.name)
				})
				if (memberRole.includes('Colorful')) {
					const buttonID = interaction.values[0]
					const role = interaction.guild.roles.cache.find(
						(role) => role.name === buttonID
					)
					if (memberRole.includes(buttonID)) {
						interaction.member.roles.remove(role)
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
					}
					interaction.reply({ content: 'Done!', ephemeral: true })
				}
			}
		} else if (interaction.isButton()) {
			if (
				interaction.guildId == '324284116021542922' &&
				interaction.channelId == '857342694691307540'
			) {
				const memberRole: string[] = []
				interaction.member.roles.cache.forEach((role) => {
					memberRole.push(role.name)
				})
				if (memberRole.includes('Colorful')) {
					if (interaction.customId == 'remove') {
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
						interaction.reply({ content: 'Done!', ephemeral: true })
					}
				}
			}
		}
	}
}

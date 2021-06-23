/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Listener } from 'discord-akairo';

const colorRole = [
	'Maya',
	'Mikado',
	'Rose',
	'Lavender',
	'Coral',
	'Cantaloupe',
	'Mint'
];

export default class ColorRoleListener extends Listener {
	constructor() {
		super('interaction', {
			emitter: 'client',
			event: 'interaction'
		});
	}

	exec(interaction) {
		if (!interaction.isButton()) return;
		if (
			interaction.guildID == '324284116021542922' &&
			interaction.channelID == '857342694691307540'
		) {
			// eslint-disable-next-line prefer-const
			let memberRole: string[] = [];
			interaction.member.roles.cache.forEach((role) => {
				memberRole.push(role.name);
			});
			const buttonID = interaction.customID;
			if (memberRole.includes('Colorful')) {
				const role = interaction.guild.roles.cache.find(
					(role) => role.name === buttonID
				);
				if (memberRole.includes(buttonID)) {
					interaction.member.roles.remove(role);
				} else {
					interaction.member.roles.add(role);
					// eslint-disable-next-line prefer-const
					let roleToRemove: string[] = [];
					memberRole.forEach((eachRole) => {
						if (eachRole == role.name) {
							return;
						} else if (colorRole.includes(eachRole)) {
							roleToRemove.push(eachRole);
						}
					});
					roleToRemove.forEach((eachRole) => {
						const rrole = interaction.guild.roles.cache.find(
							(role) => role.name === eachRole
						);
						interaction.member.roles.remove(rrole);
					});
				}
				interaction.reply({ content: 'Done!', ephemeral: true });
			}
		}
	}
}

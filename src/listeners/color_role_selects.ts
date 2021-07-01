/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Listener } from 'discord-akairo';
import { colorRole } from '../config/lists';

export default class ColorRoleSelectsListener extends Listener {
	constructor() {
		super('ColorRoleSelects', {
			emitter: 'client',
			event: 'interaction'
		});
	}

	exec(interaction) {
		if (interaction.isSelectMenu()) {
			if (
				interaction.guildID == '324284116021542922' &&
				interaction.channelID == '857342694691307540'
			) {
				// eslint-disable-next-line prefer-const
				let memberRole: string[] = [];
				interaction.member.roles.cache.forEach((role) => {
					memberRole.push(role.name);
				});
				if (memberRole.includes('Colorful')) {
					const buttonID = interaction.values[0]
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
		} else if (interaction.isButton()) {
			if (interaction.guildID == '324284116021542922' && interaction.channelID == '857342694691307540') { 
				let memberRole: string[] = [];
				interaction.member.roles.cache.forEach((role) => {
					memberRole.push(role.name);
				});
				if (memberRole.includes('Colorful')) { 
					if (interaction.customID == "remove") {
						let roleToRemove: string[] = [];
						memberRole.forEach((eachRole) => {
							if (colorRole.includes(eachRole)) {
								roleToRemove.push(eachRole);
							};
						});
						roleToRemove.forEach((eachRole) => {
							const rrole = interaction.guild.roles.cache.find(
								(role) => role.name === eachRole
							);
							interaction.member.roles.remove(rrole);
						});
						interaction.reply({ content: 'Done!', ephemeral: true });
					};
				};
			};
		};
	};
};

import { ListenerInterface } from '@sleepymaid/handler';
import { ButtonInteraction } from 'discord.js';
import { container } from 'tsyringe';
import { BotClient } from '../../lib/extensions/BotClient';
import { laserRoleManager } from '../../lib/managers/laser/roleManager';

export default class LaserRolesListener implements ListenerInterface {
	public readonly name = 'interactionCreate';
	public readonly once = false;

	public async execute(interaction: ButtonInteraction, client: BotClient) {
		if (!interaction.inCachedGuild()) return;
		if (interaction.guild.id !== '860721584373497887') return;
		if (!interaction.customId?.startsWith('laser-role-ping:')) return;

		container.register(BotClient, { useValue: client });
		if (interaction.customId === 'laser-role-ping:manage') container.resolve(laserRoleManager).startMenu(interaction);
		else if (interaction.customId === 'laser-role-ping:removeall')
			container.resolve(laserRoleManager).removeRoles(interaction);
	}
}

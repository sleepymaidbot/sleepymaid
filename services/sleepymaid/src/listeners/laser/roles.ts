import type { ListenerInterface } from '@sleepymaid/handler';
import type { ButtonInteraction } from 'discord.js';
import { container } from 'tsyringe';
import { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';
import { laserRoleManager } from '../../lib/managers/laser/roleManager';

export default class LaserRolesListener implements ListenerInterface {
	public readonly name = 'interactionCreate';
	public readonly once = false;

	public async execute(interaction: ButtonInteraction, client: SleepyMaidClient) {
		if (!interaction.inCachedGuild()) return;
		if (interaction.guild.id !== '860721584373497887') return;
		if (!interaction.customId?.startsWith('laser-role-ping:')) return;

		container.register(SleepyMaidClient, { useValue: client });
		if (interaction.customId === 'laser-role-ping:manage') container.resolve(laserRoleManager).startMenu(interaction);
		else if (interaction.customId === 'laser-role-ping:removeall')
			container.resolve(laserRoleManager).removeRoles(interaction);
	}
}

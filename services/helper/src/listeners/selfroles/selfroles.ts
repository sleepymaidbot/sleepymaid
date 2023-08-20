import type { ListenerInterface } from '@sleepymaid/handler';
import { BaseInteraction } from 'discord.js';

export default class SelfRoleListener implements ListenerInterface {
	public readonly name = 'interactionCreate';
	public readonly once = false;

	public async execute(interaction: BaseInteraction) {
		if (!interaction.isButton()) return;
		if (!interaction.inCachedGuild()) return;
		if (!interaction.customId.startsWith('selfrole:')) return;
		const roleId = interaction.customId.split(':')[1];
		if (!roleId) return;
		const role = interaction.guild?.roles.cache.get(roleId);
		if (!role) return;
		if (!interaction.member) return;
		if (interaction.member.roles.cache.has(roleId)) {
			await interaction.member.roles.remove(roleId);
			await interaction.reply({
				content: `You no longer have the role ${role.toString()}`,
				ephemeral: true,
				allowedMentions: { parse: [] },
			});
		} else {
			await interaction.member.roles.add(roleId);
			await interaction.reply({
				content: `You now have the role ${role.toString()}`,
				ephemeral: true,
				allowedMentions: { parse: [] },
			});
		}
	}
}

import type { ListenerInterface } from '@sleepymaid/handler';
import { BaseInteraction } from 'discord.js';

export default class SelfRoleListener implements ListenerInterface {
	public readonly name = 'interactionCreate';
	public readonly once = false;

	public async execute(interaction: BaseInteraction) {
		if (!interaction.inCachedGuild()) return;
		if (!interaction.isButton()) return;
		await interaction.deferReply({ ephemeral: true });
		if (!interaction.customId.startsWith('selfrole:')) return;
		const roleId = interaction.customId.split(':')[1];
		if (!roleId) return await interaction.editReply({ content: 'Something went wrong.' });
		const role = interaction.guild?.roles.cache.get(roleId);
		if (!role) return await interaction.editReply({ content: 'Something went wrong.' });
		if (!interaction.member) return await interaction.editReply({ content: 'Something went wrong.' });
		if (!interaction.channel) return await interaction.editReply({ content: 'Something went wrong.' });
		if (interaction.member.roles.cache.has(roleId)) {
			await interaction.member.roles.remove(
				roleId,
				`Selfrole in #${interaction.channel.name} (${interaction.channel.id}))`,
			);
			return await interaction.editReply({
				content: `You no longer have the role ${role.toString()}`,
				allowedMentions: { parse: [] },
			});
		} else {
			await interaction.member.roles.add(
				roleId,
				`Selfrole in #${interaction.channel.name} (${interaction.channel.id}))`,
			);
			return await interaction.editReply({
				content: `You now have the role ${role.toString()}`,
				allowedMentions: { parse: [] },
			});
		}
	}
}

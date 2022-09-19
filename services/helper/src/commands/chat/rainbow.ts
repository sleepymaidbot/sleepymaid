import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ChatInputCommandInteraction, resolveColor, ColorResolvable } from 'discord.js';

let onCooldown = false;

export default class RainbowCommand implements SlashCommandInterface {
	public readonly guildIds = ['324284116021542922'];
	public readonly data = {
		name: 'rainbow',
		description: 'Change la couleur du rôle vraiment cool.',
	};
	public async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		const role = interaction.guild.roles.cache.get('944706938946609232');
		if (!role) return;
		if (!interaction.member.roles.cache.has('944706938946609232'))
			return interaction.reply({
				embeds: [
					{
						color: role.color,
						description: 'Tu doit avoir le rôle `Vraiment Cool` pour utiliser cette commande.',
					},
				],
				ephemeral: true,
			});

		const getRandomColor = () => {
			const letters = '0123456789ABCDEF';
			let color = '#';
			for (let i = 0; i < 6; i++) {
				color += letters[Math.floor(Math.random() * 16)];
			}
			return color;
		};

		if (onCooldown === true)
			return interaction.reply({
				embeds: [
					{
						color: role.color,
						description: 'La commande est en cooldown.',
					},
				],
				ephemeral: true,
			});

		const color = resolveColor(getRandomColor() as ColorResolvable);

		await role.setColor(color, 'Changed by: ' + interaction.user.tag).then(() => {
			onCooldown = true;
			setTimeout(() => (onCooldown = false), 300000);
		});

		return await interaction.reply({
			embeds: [
				{
					color: color,
					description: `La couleur du rôle vraiment cool a été changée en #${color}.`,
				},
			],
			ephemeral: true,
		});
	}
}

import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ChatInputCommandInteraction, PermissionFlagsBits, PermissionsBitField } from 'discord.js';

export default class ReasonCommand implements SlashCommandInterface {
	public readonly data = {
		name: 'reason',
		description: 'Change the reason of an infraction',
		defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.ModerateMembers]),
	};
	public async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		interaction.reply({ content: 'This command is not yet implemented', ephemeral: true });
	}
}

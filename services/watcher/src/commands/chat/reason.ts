import type { SlashCommandInterface } from '@sleepymaid/handler';
import { getLocalizedProp } from '@sleepymaid/shared';
import { ChatInputCommandInteraction, PermissionFlagsBits, PermissionsBitField } from 'discord.js';

export default class ReasonCommand implements SlashCommandInterface {
	public readonly data = {
		...getLocalizedProp('name', 'commands.reason.name'),
		...getLocalizedProp('description', 'commands.reason.description'),
		defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.ModerateMembers]),
	};
	public async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		interaction.reply({ content: 'This command is not yet implemented', ephemeral: true });
	}
}

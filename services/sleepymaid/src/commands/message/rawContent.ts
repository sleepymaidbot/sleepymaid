import type { MessageCommandInterface } from '@sleepymaid/handler';
import { getLocalizedProp } from '@sleepymaid/shared';
import { ApplicationCommandType, MessageContextMenuCommandInteraction } from 'discord.js';

export default class RatioUserCommand implements MessageCommandInterface {
	public readonly data = {
		...getLocalizedProp('name', 'commands.raw_content.name'),
		type: ApplicationCommandType.Message,
	} as const;

	public async execute(interaction: MessageContextMenuCommandInteraction) {
		await interaction.reply({
			content: '```' + interaction.targetMessage.content + '```',
			ephemeral: true,
		});
	}
}

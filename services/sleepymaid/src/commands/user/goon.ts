import type { UserCommandInterface } from '@sleepymaid/handler';
import { getLocalizedProp, ratioGuildIds } from '@sleepymaid/shared';
import { ApplicationCommandType } from 'discord-api-types/v10';
import type { UserContextMenuCommandInteraction } from 'discord.js';
import i18next from 'i18next';

export default class RatioUserCommand implements UserCommandInterface {
	public readonly guildIds = ratioGuildIds;
	public readonly data = {
		...getLocalizedProp('name', 'commands.goon.name'),
		type: ApplicationCommandType.User,
	} as const;

	public async execute(interaction: UserContextMenuCommandInteraction) {
		const target = interaction.options.get('user');
		if (target === null) return;
		await interaction.reply({
			content: i18next.t('commands.goon.goon', {
				lng: interaction.locale,
				target: target.value,
				author: interaction.user.id,
			}),
		});
	}
}

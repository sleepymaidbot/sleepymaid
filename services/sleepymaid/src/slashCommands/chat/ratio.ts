import type { SlashCommandInterface } from '@sleepymaid/handler';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
} from 'discord.js';
import i18next from 'i18next';
import { getLocalizedProp, ratioGuildIds } from '@sleepymaid/shared';

export default class RatioSlashCommand implements SlashCommandInterface {
	public readonly guildIds = ratioGuildIds;
	public readonly data = {
		...getLocalizedProp('name', 'commands.ratio.name'),
		...getLocalizedProp('description', 'commands.ratio.description'),
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				...getLocalizedProp('name', 'commands.ratio.user.name'),
				...getLocalizedProp('description', 'commands.ratio.user.description'),
				type: ApplicationCommandOptionType.User,
				required: true,
			},
		],
	} as ChatInputApplicationCommandData;

	public async execute(interaction: ChatInputCommandInteraction) {
		await interaction.reply({
			content: i18next.t('commands.ratio.ratio', {
				lng: interaction.locale,
				target: interaction.options.get('user')!.value,
				author: interaction.user.id,
			})!,
		});
	}
}

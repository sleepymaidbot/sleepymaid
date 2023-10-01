import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import {
	ChatInputCommandInteraction,
	ChatInputApplicationCommandData,
	PermissionsBitField,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
} from 'discord.js';
import type { HelperClient } from '../../../lib/extensions/HelperClient';
import { MessagesType, setupInteraction, getChoices } from '@sleepymaid/shared';

const messages: MessagesType = {
	selfRoles: {
		fancyName: 'SelfRoles',
		function: async () => {
			const msg1 = `# Self Roles

Click the button below to get the role you want. You can remove the role by clicking the button again.

## Games

These roles allow you to access the game channels.
			`;

			const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents([
				new ButtonBuilder()
					.setCustomId('selfrole:1150543724317786202')
					.setLabel('Valorant')
					.setStyle(ButtonStyle.Primary)
					.setEmoji({ id: '1150633757120933968', name: 'valorant' }),
				new ButtonBuilder()
					.setCustomId('selfrole:1150537070574567526')
					.setLabel('Rocket League')
					.setStyle(ButtonStyle.Primary)
					.setEmoji({ id: '1150535021162152016', name: 'rocketleague' }),
			]);

			return [{ content: msg1, components: [row1] }];
		},
	},
};

export default class WhiteoutSetupCommand implements SlashCommandInterface {
	public readonly guildIds = ['1150379660128047104'];
	public readonly data = {
		name: 'whiteoutsetup',
		description: '[Admin only] Allow you to post pre-made messages.',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.Administrator]),
		options: [
			{
				name: 'name',
				description: 'The name of the command',
				type: ApplicationCommandOptionType.String,
				choices: getChoices(messages),
				required: true,
			},
			{
				name: 'message_id',
				description: 'The id of the message you want to edit',
				type: ApplicationCommandOptionType.String,
				required: false,
			},
		],
	} as ChatInputApplicationCommandData;

	// @ts-ignore
	public async execute(interaction: ChatInputCommandInteraction, client: HelperClient) {
		if (!interaction.inCachedGuild()) return;
		if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) return;
		await setupInteraction(interaction, client, messages);
	}
}

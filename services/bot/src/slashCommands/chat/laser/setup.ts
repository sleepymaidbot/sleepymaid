import type { SlashCommandInterface } from '@sleepymaid/handler';
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ButtonStyle,
	PermissionFlagsBits,
	ComponentType,
	APIActionRowComponent,
	APIEmbedAuthor,
	APIButtonComponent,
	APIEmbed,
} from 'discord-api-types/v10';
import type {
	ChatInputCommandInteraction,
	MessageCreateOptions,
	MessageEditOptions,
	ChatInputApplicationCommandData,
	AutocompleteInteraction,
} from 'discord.js';
import type { BotClient } from '../../../lib/extensions/BotClient';
import { getAutocompleteResults } from '@sleepymaid/shared';

interface MessagesType {
	[key: string]: MessageType;
}

interface MessageType {
	fancyName: string;
	function: (i: ChatInputCommandInteraction) => Promise<MessageCreateOptions & MessageEditOptions>;
}

const messages: MessagesType = {
	'self-roles-setup': {
		fancyName: 'Self-Roles Setup',
		function: async () => {
			const row: APIActionRowComponent<APIButtonComponent> = {
				type: 1,
				components: [
					{
						type: ComponentType.Button,
						label: 'Manage my roles',
						style: ButtonStyle.Success,
						custom_id: 'laser-role-ping:manage',
						emoji: {
							id: '975870168251113545',
						},
					},
					{
						type: ComponentType.Button,
						label: 'Remove all my roles',
						style: ButtonStyle.Danger,
						custom_id: 'laser-role-ping:removeall',
						emoji: {
							id: '948606748334358559',
						},
					},
				],
			};

			const embed: APIEmbed = {
				title: 'Self-assignable roles',
				description: 'With this message you can assign yourself some roles.',
				fields: [
					{
						name: 'Why ?',
						value:
							'Those roles are use to only get pings when we are doing a specific map secret on a specific server.',
						inline: true,
					},
					{
						name: 'How ?',
						value:
							"Click the button 'Manage my roles' to select the servers you are willing to complete map secrets on! \n Click the button 'Remove all my roles' to remove all your roles.",
						inline: true,
					},
				],
			};

			return {
				embeds: [embed],
				components: [row],
			};
		},
	},
};

export default class LaserSetupCommand implements SlashCommandInterface {
	public readonly guildIds = ['860721584373497887'];
	public readonly data = {
		name: 'setup',
		description: '[Admin only] Allow you to post pre-made messages.',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: 'name',
				description: 'The name of the command',
				type: ApplicationCommandOptionType.String,
				autocomplete: true,
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
	public async execute(interaction: ChatInputCommandInteraction, client: BotClient) {
		if (!interaction.inCachedGuild()) return;
		if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) return;
		const name = interaction.options.getString('name')!;
		const msg = messages[name];
		if (!msg) return;
		const messageId = interaction.options.getString('message_id');
		if (messageId) {
			const message = await interaction.channel?.messages.fetch(messageId);
			if (!message) {
				await interaction.reply({
					embeds: [
						{
							color: 3553599,
							description: '<:redX:948606748334358559> Message not found.',
						},
					],
					ephemeral: true,
				});
			}
			if (message?.author.id !== client.user?.id) {
				await interaction.reply({
					embeds: [
						{
							color: 3553599,
							description: '<:redX:948606748334358559> You can only edit messages sent by the bot.',
						},
					],
					ephemeral: true,
				});
			} else {
				await message?.edit(await msg.function(interaction));
			}
		} else {
			await interaction.channel?.send(await msg.function(interaction));
		}
		await interaction.reply({
			embeds: [
				{
					color: 3553599,
					description: '<:greenTick:948620600144982026> Done!',
				},
			],
			ephemeral: true,
		});
	}

	public async autocomplete(interaction: AutocompleteInteraction) {
		if (!interaction.inCachedGuild()) return;
		const getChoices = () => {
			const choices = [];
			for (const [k, v] of Object.entries(messages)) {
				choices.push({
					name: v.fancyName,
					value: k,
				});
			}
			return choices;
		};
		await interaction.respond(getAutocompleteResults(getChoices(), interaction.options.getFocused()));
	}
}

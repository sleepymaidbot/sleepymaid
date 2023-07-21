import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ApplicationCommandOptionType, ApplicationCommandType, PermissionFlagsBits } from 'discord-api-types/v10';
import {
	ChatInputCommandInteraction,
	MessageCreateOptions,
	MessageEditOptions,
	ChatInputApplicationCommandData,
	PermissionsBitField,
} from 'discord.js';
import type { HelperClient } from '../../../lib/extensions/HelperClient';

interface MessagesType {
	[key: string]: MessageType;
}

interface MessageType {
	fancyName: string;
	function: (i: ChatInputCommandInteraction) => Promise<Array<MessageCreateOptions & MessageEditOptions>>;
}

const messages: MessagesType = {
	setupWelcome: {
		fancyName: 'Welcome',
		function: async () => {
			const msg1 = `# QCG Secret
This server is made to help and contribute to the completion of the secret on the Québec Games servers.
## Rules
- Be respectful to everyone.
- No NSFW content.
- No spamming.
- No advertising.
- No racism, homophobia, transphobia, etc.
- No politics.
- No harassment.
- No impersonation.
- No doxxing.
## Roles
<@&1131655066462466178> » The admin role. They manage the server.
<@&1131655038473879634> » The moderator role. They moderate the server.
<@&1131659418648445010> » Given to the admins of the Québec Games servers.
<@&1131658226363015339> » Given to people that have done a significant contribution to any of the secret completion.
<@&1131656791118336071> » The default role. Given to everyone.

## Useful links
Guides » <https://qcgsecret.ecorte.xyz/>
Permanent invite link » <https://discord.gg/h65PAkZgru>
Québec Games Discord » <https://discord.gg/qcgames>
			`;

			return [{ content: msg1 }];
		},
	},
};

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

export default class QCGSecretSetupCommand implements SlashCommandInterface {
	public readonly guildIds = ['1131653884377579651'];
	public readonly data = {
		name: 'setup',
		description: '[Admin only] Allow you to post pre-made messages.',
		type: ApplicationCommandType.ChatInput,
		defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.Administrator]),
		options: [
			{
				name: 'name',
				description: 'The name of the command',
				type: ApplicationCommandOptionType.String,
				choices: getChoices(),
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
		const name = interaction.options.getString('name');
		if (!name) return;
		const msg = messages[name];
		if (!msg) return;
		const messageId = interaction.options.getString('message_id');
		console.log('b4');
		if (messageId) {
			const message = await interaction.channel?.messages.fetch(messageId);
			if (!message) {
				await interaction
					.reply({
						embeds: [
							{
								color: 3553599,
								description: '<:redX:948606748334358559> Message not found.',
							},
						],
						ephemeral: true,
					})
					.catch(client.logger.error);
			}
			if (message?.author.id !== client.user?.id) {
				await interaction
					.reply({
						embeds: [
							{
								color: 3553599,
								description: '<:redX:948606748334358559> You can only edit messages sent by the bot.',
							},
						],
						ephemeral: true,
					})
					.catch(client.logger.error);
			} else {
				const msgs = await msg.function(interaction);
				if (msgs.length === 1) await message?.edit((await msgs[0]) as MessageEditOptions);
				else
					await interaction
						.reply({
							embeds: [
								{
									color: 3553599,
									description: '<:redX:948606748334358559> Message too big.',
								},
							],
							ephemeral: true,
						})
						.catch(client.logger.error);
			}
		} else {
			console.log('not an edit');
			await msg
				.function(interaction)
				.then((msgs) =>
					msgs.forEach(async (msg) => {
						console.log('sending msg');
						await interaction?.channel?.send({ ...msg, allowedMentions: { parse: [] } }).catch(client.logger.error);
					}),
				)
				.catch(client.logger.error);
		}
		await interaction
			.reply({
				embeds: [
					{
						color: 3553599,
						description: '<:greenTick:948620600144982026> Done!',
					},
				],
				ephemeral: true,
			})
			.catch(client.logger.error);
	}
}

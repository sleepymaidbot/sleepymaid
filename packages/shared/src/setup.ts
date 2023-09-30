import { ChatInputCommandInteraction, MessageCreateOptions, MessageEditOptions } from 'discord.js';
import { HandlerClient } from '@sleepymaid/handler';

export interface MessagesType {
	[key: string]: MessageType;
}

interface MessageType {
	fancyName: string;
	function: (i: ChatInputCommandInteraction) => Promise<Array<MessageCreateOptions & MessageEditOptions>>;
}

export const getChoices = (messages: MessagesType) => {
	const choices = [];
	for (const [k, v] of Object.entries(messages)) {
		choices.push({
			name: v.fancyName,
			value: k,
		});
	}
	return choices;
};

export const setupInteraction = async (
	interaction: ChatInputCommandInteraction<'cached'>,
	client: HandlerClient,
	messages: MessagesType,
) => {
	const name = interaction.options.getString('name');
	if (!name) return;
	const msg = messages[name];
	if (!msg) return;
	const messageId = interaction.options.getString('message_id');
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
		await msg
			.function(interaction)
			.then((msgs) =>
				msgs.forEach(async (msg) => {
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
};

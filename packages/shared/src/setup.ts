import type { HandlerClient } from "@sleepymaid/handler";
import type { ChatInputCommandInteraction, MessageCreateOptions, MessageEditOptions } from "discord.js";

export type MessagesType = {
	[key: string]: MessageType;
};

type MessageFunctionType = (MessageCreateOptions & MessageEditOptions)[];

type MessageType = {
	fancyName: string;
	function(i: ChatInputCommandInteraction): MessageFunctionType | Promise<MessageFunctionType>;
};

export const getChoices = (messages: MessagesType) => {
	const choices = [];
	for (const [key, value] of Object.entries(messages)) {
		choices.push({
			name: value.fancyName,
			value: key,
		});
	}

	return choices;
};

export const setupInteraction = async (
	interaction: ChatInputCommandInteraction<"cached">,
	client: HandlerClient,
	messages: MessagesType,
) => {
	const name = interaction.options.getString("name");
	if (!name) return;
	const msg = messages[name];
	if (!msg) return;
	const messageId = interaction.options.getString("message_id");
	if (messageId) {
		const message = await interaction.channel?.messages.fetch(messageId);
		if (!message) {
			await interaction
				.reply({
					embeds: [
						{
							color: 3_553_599,
							description: "<:redX:948606748334358559> Message not found.",
						},
					],
					ephemeral: true,
				})
				.catch(client.logger.error);
		}

		if (message?.author.id === client.user?.id) {
			const msgs = await msg.function(interaction);
			if (msgs.length === 1) await message?.edit(msgs[0] as MessageEditOptions);
			else
				await interaction
					.reply({
						embeds: [
							{
								color: 3_553_599,
								description: "<:redX:948606748334358559> Message too big.",
							},
						],
						ephemeral: true,
					})
					.catch(client.logger.error);
		} else {
			await interaction
				.reply({
					embeds: [
						{
							color: 3_553_599,
							description: "<:redX:948606748334358559> You can only edit messages sent by the bot.",
						},
					],
					ephemeral: true,
				})
				.catch(client.logger.error);
		}
	} else {
		const msgs = await msg.function(interaction);
		for (const msg of msgs) {
			await interaction?.channel?.send({ ...msg, allowedMentions: { parse: [] } }).catch(client.logger.error);
		}
	}

	await interaction
		.reply({
			embeds: [
				{
					color: 3_553_599,
					description: "<:greenTick:948620600144982026> Done!",
				},
			],
			ephemeral: true,
		})
		.catch(client.logger.error);
};

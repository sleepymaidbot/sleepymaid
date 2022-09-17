import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { HandlerClient, MessageCommandInterface } from '@sleepymaid/handler';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { MessageApplicationCommandData, MessageContextMenuCommandInteraction } from 'discord.js';
import { injectable } from 'tsyringe';

@injectable()
export default class ContentCommand implements MessageCommandInterface {
	public readonly data = new ContextMenuCommandBuilder()
		.setName('Get Message Content')
		.setType(ApplicationCommandType.Message)
		.toJSON() as MessageApplicationCommandData;
	public readonly guildIds = ['821717486217986098'];

	public async execute(interaction: MessageContextMenuCommandInteraction<'cached'>, client: HandlerClient) {
		try {
			interaction.reply(`The content of the targeted message is ${interaction.targetMessage.content}`);
		} catch (error) {
			client.logger.error(error);
		}
	}
}

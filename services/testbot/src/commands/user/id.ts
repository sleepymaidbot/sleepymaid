import { HandlerClient, UserCommandInterface } from '@sleepymaid/handler';
import { UserApplicationCommandData, UserContextMenuCommandInteraction } from 'discord.js';
import { ContextMenuCommandBuilder } from '@discordjs/builders';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { injectable } from 'tsyringe';

@injectable()
export default class IdCommand implements UserCommandInterface {
	public readonly data = new ContextMenuCommandBuilder()
		.setName('Get User Id')
		.setType(ApplicationCommandType.User)
		.toJSON() as UserApplicationCommandData;
	public readonly guildIds = ['821717486217986098'];
	public async execute(interaction: UserContextMenuCommandInteraction<'cached'>, client: HandlerClient) {
		try {
			interaction.reply({
				content: `The user ID is ${interaction.targetUser.id}`,
				ephemeral: true,
			});
			client.logger.info(`Pong!`);
		} catch (error) {
			client.logger.error(error);
		}
	}
}

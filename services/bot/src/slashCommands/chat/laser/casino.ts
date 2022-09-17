import { SlashCommandInterface } from '@sleepymaid/handler';
import {
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	ApplicationCommandType,
	ApplicationCommandOptionType,
	resolveColor,
} from 'discord.js';

export default class LaserCasinoCommand implements SlashCommandInterface {
	public readonly guildIds = ['860721584373497887', '324284116021542922'];
	public readonly data = {
		name: 'casino',
		description: 'Base command for the casino secret.',
		type: ApplicationCommandType.ChatInput,
		options: [
			{
				name: 'getbuttonorder',
				description: 'Get the order of the buttons.',
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						name: 'control',
						description: 'The code of the control room lasers.',
						type: ApplicationCommandOptionType.Integer,
						required: true,
						min_value: 1234,
						max_value: 4321,
					},
					{
						name: 'mid',
						description: 'The code of the middle lasers.',
						type: ApplicationCommandOptionType.Integer,
						required: true,
						min_value: 1234,
						max_value: 4321,
					},
				],
			},
		],
	} as ChatInputApplicationCommandData;
	public async execute(interaction: ChatInputCommandInteraction<'cached'>) {
		switch (interaction.options.getSubcommand()) {
			case 'getbuttonorder': {
				const iroomNumber = interaction.options.getInteger('control');
				await this.checkNumber(interaction, iroomNumber);
				const imidNumber = interaction.options.getInteger('mid');
				await this.checkNumber(interaction, imidNumber);

				const roomNumbers = ('' + iroomNumber).split('');
				const midNumbers = ('' + imidNumber).split('');

				const finalOrder = [0, 0, 0, 0];
				for (let i = 0; i < 4; i++) {
					const int = parseInt(midNumbers[i]);
					const pos = parseInt(roomNumbers[i]) - 1;
					finalOrder[pos] = int;
				}
				return await interaction.reply({
					embeds: [
						{
							description: `<:greenTick:948620600144982026> The order of the buttons is: \`\`${finalOrder.join(
								' ',
							)}\`\``,
							color: resolveColor('#2f3136'),
						},
					],
					ephemeral: true,
				});
			}
		}
	}

	private async checkNumber(interaction: ChatInputCommandInteraction<'cached'>, number: number) {
		const validNumbers = [
			1234, 1243, 1324, 1342, 1423, 1432, 2134, 2143, 2314, 2341, 2413, 2431, 3124, 3142, 3214, 3241, 3412, 3421, 4123,
			4132, 4213, 4231, 4321, 4312,
		];
		if (!validNumbers.includes(number))
			return await interaction.reply({
				embeds: [
					{
						description: '<:redX:948606748334358559> Invalid numbers.',
						color: resolveColor('#2f3136'),
					},
				],
				ephemeral: true,
			});
		else return true;
	}
}

import { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";
import { Context, SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
} from "discord.js";

export default class RandomMathCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "random",
				description: "Get a random number",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "min",
						description: "The minimum number. (Default: 0)",
						type: ApplicationCommandOptionType.Integer,
					},
					{
						name: "max",
						description: "The maximum number. (Default: 100)",
						type: ApplicationCommandOptionType.Integer,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const min = interaction.options.getInteger("min") || 0;
		const max = interaction.options.getInteger("max") || 100;
		const random = Math.floor(Math.random() * (max - min + 1) + min);
		await interaction.reply({ content: `🎲 The random number is ${random}` });
	}
}

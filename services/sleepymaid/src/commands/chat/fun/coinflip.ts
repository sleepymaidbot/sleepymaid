import { SleepyMaidClient } from "../../../lib/extensions/SleepyMaidClient";
import { Context, SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
} from "discord.js";

export default class CoinflipCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "coinflip",
				description: "Flip a coin",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const result = Math.random() < 0.5;
		await interaction.reply({ content: `🎲 The coinflip result is ${result ? "heads" : "tails"}` });
	}
}

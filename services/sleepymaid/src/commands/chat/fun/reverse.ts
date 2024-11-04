import { SleepyMaidClient } from "../../../lib/extensions/SleepyMaidClient";
import { Context, SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
} from "discord.js";

export default class ReverseCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "reverse",
				description: "Reverse a string",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "string",
						description: "The string to reverse",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const string = interaction.options.getString("string", true);
		await interaction.reply({ content: `🔁 ${string.split("").reverse().join("")}` });
	}
}

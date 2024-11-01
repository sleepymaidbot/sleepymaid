import { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";
import { Context, SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
} from "discord.js";

export default class UrbanCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "urban",
				description: "Get a urban dictionary definition",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "word",
						description: "The word to get the definition of",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const word = interaction.options.getString("word");
		const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${word}`);
		const data = (await response.json()) as any;
		await interaction.editReply({
			content: `🎲 The definition of **${word}** is:\`\`\`${data.list[0].definition}\`\`\``,
		});
	}
}

import { SleepyMaidClient } from "../../../lib/extensions/SleepyMaidClient";
import { Context, SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandType,
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	InteractionContextType,
	ChatInputCommandInteraction,
} from "discord.js";

const choices = [
	"It is certain",
	"It is decidedly so",
	"Without a doubt",
	"Yes definitely",
	"You may rely on it",
	"As I see it, yes",
	"Most likely",
	"Outlook good",
	"Yes",
	"Signs point to yes",
	"Reply hazy try again",
	"Ask again later",
	"Better not tell you now",
	"Cannot predict now",
	"Concentrate and ask again",
	"Don't count on it",
	"My reply is no",
	"My sources say no",
	"Outlook not so good",
	"Very doubtful",
];

export default class EightBallCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "8ball",
				description: "Ask the magic 8ball a question",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "question",
						description: "The question to ask the magic 8ball",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const question = interaction.options.getString("question");
		const answer = choices[Math.floor(Math.random() * choices.length)];
		await interaction.reply({ content: `🎱 ${question}\n\n${answer}` });
	}
}

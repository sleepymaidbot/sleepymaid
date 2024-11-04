import { SleepyMaidClient } from "../../../lib/extensions/SleepyMaidClient";
import { Context, SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	ChatInputCommandInteraction,
} from "discord.js";

const emojis = ["🍎", "🍊", "🍐", "🍋", "🍉", "🍇", "🍓", "🍒"];

export default class SlotCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "slot",
				description: "Get a random emoji slot",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const slots = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]);
		const uniqueSlots = new Set(slots).size;

		let result;
		if (uniqueSlots === 1) result = "All matching, you won! 🎉";
		else if (uniqueSlots === 2) result = "2 in a row, you won! 🎉";
		else result = "No match, you lost 😢";

		await interaction.reply({ content: `${slots.join(" ")} ${result}` });
	}
}

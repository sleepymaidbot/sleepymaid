import { userData } from "@sleepymaid/db";
import { SleepyMaidClient } from "../../../lib/extensions/SleepyMaidClient";
import { Context, SlashCommand } from "@sleepymaid/handler";
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	InteractionContextType,
	ChatInputCommandInteraction,
	ApplicationCommandOptionType,
	Colors,
	APIEmbed,
} from "discord.js";
import { eq } from "drizzle-orm";
import { increment } from "@sleepymaid/shared";

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
				options: [
					{
						name: "amount",
						description: "The amount of money to bet",
						type: ApplicationCommandOptionType.Integer,
						required: false,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const amount = interaction.options.getInteger("amount");
		const slots = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]);
		const uniqueSlots = new Set(slots).size;

		if (!amount) {
			let result;
			if (uniqueSlots === 1) result = "All matching, you won! 🎉";
			else if (uniqueSlots === 2) result = "2 in a row, you won! 🎉";
			else result = "No match, you lost 😢";

			await interaction.reply({ content: `${slots.join(" ")} ${result}` });
			return;
		}

		const data = await this.container.client.drizzle.query.userData.findFirst({
			where: eq(userData.userId, interaction.user.id),
		});
		if (!data) return;
		if (data.currency < amount)
			return interaction.reply({ content: "You don't have enough money to bet", ephemeral: true });

		let multiplier = -1;
		if (uniqueSlots === 1) multiplier += 5;
		else if (uniqueSlots === 2) multiplier += 3;

		await this.container.client.drizzle
			.update(userData)
			.set({
				currency: increment(userData.currency, amount * multiplier),
			})
			.where(eq(userData.userId, interaction.user.id));

		const resultMessage = multiplier > 0 ? `You won ${amount * multiplier} coins! 🎉` : `You lost ${amount} coins 😢`;

		const embed: APIEmbed = {
			author: {
				name: "Slot Machine",
				icon_url:
					"https://cdn.discordapp.com/attachments/434861245846519828/1303519924777521282/1c4bba02f0519e1417e2.png",
			},
			color: Colors.Gold,
			description: `# ${slots.join(" ")} \n${resultMessage}`,
			timestamp: new Date().toISOString(),
		};

		return await interaction.reply({ embeds: [embed] });
	}
}

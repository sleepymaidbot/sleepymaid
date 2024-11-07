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

export default class GamblingCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "gambling",
				description: "Play the gambling games",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "slot",
						description: "Play the slot machine",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "amount",
								description: "The amount of money to bet",
								type: ApplicationCommandOptionType.Integer,
								required: true,
							},
						],
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case "slot":
				return this.slot(interaction);
			default:
				return interaction.reply({ content: "Invalid subcommand", ephemeral: true });
		}
	}

	private async slot(interaction: ChatInputCommandInteraction) {
		const amount = interaction.options.getInteger("amount");
		const slots = Array.from({ length: 3 }, () => emojis[Math.floor(Math.random() * emojis.length)]);
		const uniqueSlots = new Set(slots).size;

		if (!amount || amount <= 0) {
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
		// x4
		if (uniqueSlots === 1) multiplier += 5;
		// x10
		else if (uniqueSlots === 2) multiplier += 11;

		const returning = await this.container.client.drizzle
			.update(userData)
			.set({
				currency: increment(userData.currency, amount * multiplier),
			})
			.where(eq(userData.userId, interaction.user.id))
			.returning({ currency: userData.currency });

		const resultMessage = multiplier > 0 ? `You won ${amount * multiplier} coins! 🎉` : `You lost ${amount} coins 😢`;

		const embed: APIEmbed = {
			author: {
				name: "Slot Machine",
				icon_url:
					"https://cdn.discordapp.com/attachments/434861245846519828/1303519924777521282/1c4bba02f0519e1417e2.png",
			},
			color: Colors.Gold,
			description: `# ${slots.join(" ")} \n${resultMessage}\nYou now have ${returning[0]?.currency} coins.`,
			timestamp: new Date().toISOString(),
		};

		this.container.client.logger.info(
			`${interaction.user.username} played slot machine and got ${amount * multiplier} coins`,
		);

		return await interaction.reply({ embeds: [embed] });
	}
}

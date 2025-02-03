import { Context, Listener } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { Events, Interaction, MessageFlags } from "discord.js";
import { lotteries, userData, userLotteries } from "@sleepymaid/db";
import { and, eq } from "drizzle-orm";

export default class extends Listener<Events.InteractionCreate, SleepyMaidClient> {
	constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: Events.InteractionCreate,
		});
	}

	public override async execute(interaction: Interaction) {
		if (!interaction.isButton()) return;
		if (!interaction.customId.startsWith("lottery:enter:")) return;
		const id = interaction.customId.split(":")[2];
		if (!id) return;
		const lot = await this.container.drizzle.query.lotteries.findFirst({
			where: eq(lotteries.lotteryId, parseInt(id)),
		});
		if (!lot) return;
		const data = await this.container.drizzle.query.userData.findFirst({
			where: eq(userData.userId, interaction.user.id),
		});
		if (!data) {
			await interaction.reply({
				content: "You don't have any money in your wallet!",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		const userLottery = await this.container.drizzle.query.userLotteries.findFirst({
			where: and(eq(userLotteries.userId, interaction.user.id), eq(userLotteries.lotteryId, lot.lotteryId)),
		});
		if (userLottery) {
			await interaction.reply({
				content: "You have already entered the lottery!",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		await this.container.drizzle
			.insert(userLotteries)
			.values({
				userId: interaction.user.id,
				lotteryId: lot.lotteryId,
			})
			.onConflictDoNothing();

		this.container.logger.debug(`${interaction.user.username} has entered the lottery!`);

		await interaction.reply({
			content: `You have entered the lottery!`,
			flags: MessageFlags.Ephemeral,
		});
	}
}

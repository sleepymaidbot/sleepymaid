import { Context, Listener } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../lib/SleepyMaidClient";
import { Events, Interaction } from "discord.js";
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
				ephemeral: true,
			});
			return;
		}
		const userLottery = await this.container.drizzle.query.userLotteries.findFirst({
			where: and(eq(userLotteries.userId, interaction.user.id), eq(userLotteries.lotteryId, lot.lotteryId)),
		});
		if (userLottery) {
			await interaction.reply({
				content: "You have already entered the lottery!",
				ephemeral: true,
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
		await interaction.reply({
			content: `You have entered the lottery!`,
			ephemeral: true,
		});
	}
}

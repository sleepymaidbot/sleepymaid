import { Context, Task } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../lib/SleepyMaidClient";
import { lotteries, userLotteries } from "@sleepymaid/db";
import { eq, lte } from "drizzle-orm";
import { getUnixTime } from "date-fns";
import { Colors } from "discord.js";
import { formatNumber } from "@sleepymaid/shared";

export default class extends Task<SleepyMaidClient> {
	constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			interval: "*/10 * * * *",
			runOnStart: true,
		});
	}

	private async deleteLottery(lotteryId: number) {
		await this.container.drizzle.delete(lotteries).where(eq(lotteries.lotteryId, lotteryId));
		await this.container.drizzle.delete(userLotteries).where(eq(userLotteries.lotteryId, lotteryId));
	}

	public override async execute() {
		this.container.logger.debug("Lottery task started");

		const lotteriesList = await this.container.drizzle.query.lotteries.findMany({
			where: lte(lotteries.expiredTime, new Date()),
		});

		if (lotteriesList.length === 0) return;

		for (const lottery of lotteriesList) {
			this.container.logger.info(`Processing lottery: ${lottery.lotteryId}`);

			const users = await this.container.drizzle.query.userLotteries.findMany({
				where: eq(userLotteries.lotteryId, lottery.lotteryId),
			});

			const winner = users[Math.floor(Math.random() * users.length)];

			if (!winner) {
				this.container.logger.debug(`No winner found for lottery: ${lottery.lotteryId}`);
				await this.deleteLottery(lottery.lotteryId);
				continue;
			}

			const guild = await this.container.client.guilds.fetch(lottery.guildId);
			if (!guild) {
				this.container.logger.debug(`Guild not found for lottery: ${lottery.lotteryId}`);
				await this.deleteLottery(lottery.lotteryId);
				continue;
			}

			const user = await this.container.client.users.fetch(winner.userId);
			if (!user) {
				this.container.logger.debug(`User not found for lottery: ${lottery.lotteryId}`);
				await this.deleteLottery(lottery.lotteryId);
				continue;
			}

			const channel = await guild.channels.fetch(lottery.channelId);
			if (!channel || !channel.isSendable()) {
				this.container.logger.debug(`Channel not found for lottery: ${lottery.lotteryId}`);
				await this.deleteLottery(lottery.lotteryId);
				continue;
			}

			const message = await channel.messages.fetch(lottery.messageId);
			if (!message) {
				this.container.logger.debug(`Message not found for lottery: ${lottery.lotteryId}`);
				await this.deleteLottery(lottery.lotteryId);
				continue;
			}

			await message.edit({
				components: [],
				embeds: [
					{
						description: `Lottery has ended <t:${getUnixTime(lottery.expiredTime)}:R>!\n\n**Winner:** ${user}`,
						color: Colors.Yellow,
						title: "Lottery Ended",
						fields: [
							{
								name: "**Amount**",
								value: formatNumber(lottery.lotteryAmount),
							},
							{
								name: "**Participants**",
								value: `${users.length}`,
							},
						],
					},
				],
			});
			await message.reply({
				content: `${user} has won ${lottery.lotteryAmount} coins in the lottery!`,
				allowedMentions: {
					users: [user.id],
				},
			});
			await user
				.send({
					content: `You have won ${lottery.lotteryAmount} coins in the lottery!\nhttps://discord.com/channels/${lottery.guildId}/${lottery.channelId}/${lottery.messageId}`,
				})
				.catch(() => {
					this.container.logger.debug(`Failed to send message to user: ${user.id}`);
				});
			await this.container.manager.addBalance(user.id, lottery.lotteryAmount);

			await this.deleteLottery(lottery.lotteryId);
		}
	}
}

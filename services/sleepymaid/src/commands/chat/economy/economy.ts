import { Context, SlashCommand } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient";
import {
	ActionRowBuilder,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ButtonStyle,
	ButtonBuilder,
	ChatInputCommandInteraction,
	InteractionContextType,
	InteractionReplyOptions,
	InteractionUpdateOptions,
	MessageComponentInteraction,
	SectionBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	ThumbnailBuilder,
} from "discord.js";
import { ApplicationCommandOptionType, MessageFlags, SeparatorSpacingSize } from "discord-api-types/v10";
import { userData } from "@sleepymaid/db";
import { desc, eq, sql } from "drizzle-orm";
import DBCheckPrecondtion from "../../../preconditions/dbCheck";
import { formatNumber } from "@sleepymaid/shared";

const rewards: Record<"daily" | "weekly" | "monthly" | "work", () => number> = {
	daily: () => 1000,
	weekly: () => 5000,
	monthly: () => 10000,
	work: () => {
		return Math.floor(Math.random() * 101) + 50;
	},
};

export default class EconomyCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			preconditions: [DBCheckPrecondtion],
			data: {
				name: "economy",
				description: "Base commande for economy",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "balance",
						description: "Get your balance",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "user",
								description: "The user to get the balance of",
								type: ApplicationCommandOptionType.User,
								required: false,
							},
						],
					},
					{
						name: "leaderboard",
						description: "Get the leaderboard",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "page",
								description: "The page to get",
								type: ApplicationCommandOptionType.Integer,
								required: false,
								min_value: 1,
							},
						],
					},
					{
						name: "daily",
						description: "Get your daily reward",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "weekly",
						description: "Get your weekly reward",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "monthly",
						description: "Get your monthly reward",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "work",
						description: "Work for money",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "give",
						description: "Give money to someone",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "user",
								description: "The user to give money to",
								type: ApplicationCommandOptionType.User,
								required: true,
							},
							{
								name: "amount",
								description: "The amount of money to give",
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
			case "balance":
				await this.balance(interaction);
				break;
			case "leaderboard":
				await this.leaderboard(interaction);
				break;
			case "daily":
				await this.daily(interaction);
				break;
			case "weekly":
				await this.weekly(interaction);
				break;
			case "monthly":
				await this.monthly(interaction);
				break;
			case "work":
				await this.work(interaction);
				break;
			case "give":
				await this.give(interaction);
				break;
			default:
				await interaction.reply({ content: "Invalid subcommand", flags: MessageFlags.Ephemeral });
				break;
		}
		await this.container.manager.updateUserMetadata(interaction.user.id);
	}

	private async balance(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser("user") ?? interaction.user;
		const balance = await this.container.client.drizzle.query.userData.findFirst({
			where: eq(userData.userId, user.id),
		});

		const leaderboardPosition = await this.container.client.drizzle.query.userData.findMany({
			where: sql`${userData.currency} > ${balance?.currency ?? 0}`,
			columns: {
				userId: true,
			},
		});

		const position = leaderboardPosition.length + 1;

		await interaction.reply({
			flags: [MessageFlags.IsComponentsV2],
			components: [
				new SectionBuilder()
					.setThumbnailAccessory(
						new ThumbnailBuilder().setURL(user.avatarURL() ?? interaction.client.user.avatarURL() ?? ""),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`# 👤 Viewing profile of ${user.displayName}
🪙 ${formatNumber(balance?.currency ?? 0)} coins
🏆 ${position}th on the currency leaderboard`,
						),
					),
			],
		});
	}

	private async leaderboard(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply();
		const medals = {
			0: "🥇",
			1: "🥈",
			2: "🥉",
			3: "4️⃣",
			4: "5️⃣",
			5: "6️⃣",
			6: "7️⃣",
			7: "8️⃣",
			8: "9️⃣",
			9: "🔟",
		};
		const page = interaction.options.getInteger("page") ?? 1;

		const getEmbed = async (page: number): Promise<InteractionReplyOptions & InteractionUpdateOptions> => {
			page = Math.min(20, page);
			const leaderboard = await this.container.client.drizzle.query.userData.findMany({
				orderBy: desc(userData.currency),
				limit: 5,
				offset: (page - 1) * 5,
			});

			return {
				components: [
					...leaderboard
						.map((user, index) => {
							const displayIndex = index + (page - 1) * 5;
							const name = user.displayName ?? user.userName;
							const prefix = medals[displayIndex as keyof typeof medals] ?? `${displayIndex + 1}.`;
							return [
								new SectionBuilder()
									.addTextDisplayComponents(
										new TextDisplayBuilder().setContent(`${prefix} **${name}**: ${formatNumber(user.currency)}`),
									)
									.setThumbnailAccessory(
										new ThumbnailBuilder().setURL(
											user.avatarHash ? `https://cdn.discordapp.com/avatars/${user.userId}/${user.avatarHash}.png` : "",
										),
									),
								...(index < leaderboard.length - 1
									? [new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)]
									: []),
							];
						})
						.flat(),
					new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setCustomId(page === 1 ? "none_prev" : `economy_leaderboard_${page - 1}`)
							.setEmoji("⬅️")
							.setStyle(ButtonStyle.Primary)
							.setDisabled(page === 1),
						new ButtonBuilder()
							.setCustomId(page === 1 ? `economy_leaderboard_reset` : "none_current")
							.setLabel(page.toString())
							.setStyle(ButtonStyle.Primary)
							.setDisabled(page === 1),
						new ButtonBuilder()
							.setCustomId(page === 20 ? "none_next" : `economy_leaderboard_${page + 1}`)
							.setEmoji("➡️")
							.setStyle(ButtonStyle.Primary),
					),
				],
			};
		};
		const message = await interaction.editReply({ ...(await getEmbed(page)), flags: [MessageFlags.IsComponentsV2] });
		message
			.createMessageComponentCollector({
				time: 1000 * 60 * 5,
				filter: (i: MessageComponentInteraction) => {
					return i.customId.startsWith("economy_leaderboard_");
				},
			})
			.on("collect", async (i: MessageComponentInteraction) => {
				if (i.user.id === interaction.user.id) {
					const page = parseInt(i.customId.split("_")[2] ?? "1");
					await i.update(await getEmbed(page));
				} else {
					await i.reply({ content: "This is not your interaction", flags: MessageFlags.Ephemeral });
				}
			})
			.on("end", () => {
				interaction.editReply({ components: [] });
			});
	}

	private async daily(interaction: ChatInputCommandInteraction) {
		const data = await this.container.client.drizzle.query.userData.findFirst({
			where: eq(userData.userId, interaction.user.id),
		});
		if (!data) {
			await interaction.reply("An error occurred while fetching your data, please try again later.");
			return;
		}
		if (data.dailyTimestamp && Date.now() - data.dailyTimestamp.getTime() < 24 * 60 * 60 * 1000) {
			const timeLeft = new Date(data.dailyTimestamp.getTime() + 24 * 60 * 60 * 1000 - Date.now());
			await interaction.reply(
				`You have already claimed your daily reward. Come back in ${timeLeft.getUTCHours()}h ${timeLeft.getUTCMinutes()}m.`,
			);
			return;
		}

		const reward = rewards.daily() + (data.dailyStreak ?? 0) * 10;

		await this.container.client.drizzle
			.update(userData)
			.set({
				dailyTimestamp: new Date(),
				currency: sql`${userData.currency} + ${reward}`,
				dailyStreak: sql`${userData.dailyStreak} + 1`,
			})
			.where(eq(userData.userId, interaction.user.id));

		this.container.client.logger.info(
			`${interaction.user.username} (${interaction.user.id}) claimed their daily reward of ${reward} coins!`,
		);

		await interaction.reply({
			flags: [MessageFlags.IsComponentsV2],
			components: [
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`# 💰 Daily Reward\n🪙 You claimed your daily reward of ${reward} coins!
🔢 Your current streak is ${(data.dailyStreak ?? 0) + 1} days.`,
						),
					)
					.setThumbnailAccessory(
						new ThumbnailBuilder().setURL(interaction.user.avatarURL() ?? interaction.client.user.avatarURL() ?? ""),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("reminder:in:1440:daily:" + interaction.user.id)
						.setEmoji("⏰")
						.setLabel("Set a reminder for 1 day")
						.setStyle(ButtonStyle.Success),
				),
			],
		});
	}

	private async weekly(interaction: ChatInputCommandInteraction) {
		const data = await this.container.client.drizzle.query.userData.findFirst({
			where: eq(userData.userId, interaction.user.id),
		});
		if (!data) {
			await interaction.reply("An error occurred while fetching your data, please try again later.");
			return;
		}
		if (data.weeklyTimestamp && Date.now() - data.weeklyTimestamp.getTime() < 7 * 24 * 60 * 60 * 1000) {
			const timeLeft = new Date(data.weeklyTimestamp.getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now());
			await interaction.reply(
				`You have already claimed your weekly reward. Come back in ${timeLeft.getUTCDate() - 1}d ${timeLeft.getUTCHours()}h ${timeLeft.getUTCMinutes()}m.`,
			);
			return;
		}
		const reward = rewards.weekly() + (data.weeklyStreak ?? 0) * 10;

		await this.container.client.drizzle
			.update(userData)
			.set({
				currency: sql`${userData.currency} + ${reward}`,
				weeklyStreak: sql`${userData.weeklyStreak} + 1`,
				weeklyTimestamp: new Date(),
			})
			.where(eq(userData.userId, interaction.user.id));

		this.container.client.logger.info(
			`${interaction.user.username} (${interaction.user.id}) claimed their weekly reward of ${reward} coins!`,
		);

		await interaction.reply({
			flags: [MessageFlags.IsComponentsV2],
			components: [
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`# 💰 Weekly Reward\n🪙 You claimed your weekly reward of ${reward} coins!
🔢 Your current streak is ${(data.weeklyStreak ?? 0) + 1} weeks.`,
						),
					)
					.setThumbnailAccessory(
						new ThumbnailBuilder().setURL(interaction.user.avatarURL() ?? interaction.client.user.avatarURL() ?? ""),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("reminder:in:10080:weekly:" + interaction.user.id)
						.setEmoji("⏰")
						.setLabel("Set a reminder for 1 week")
						.setStyle(ButtonStyle.Success),
				),
			],
		});
	}

	private async monthly(interaction: ChatInputCommandInteraction) {
		const data = await this.container.client.drizzle.query.userData.findFirst({
			where: eq(userData.userId, interaction.user.id),
		});
		if (!data) {
			await interaction.reply("An error occurred while fetching your data, please try again later.");
			return;
		}
		if (data.monthlyTimestamp && Date.now() - data.monthlyTimestamp.getTime() < 30 * 24 * 60 * 60 * 1000) {
			const timeLeft = new Date(data.monthlyTimestamp.getTime() + 30 * 24 * 60 * 60 * 1000 - Date.now());
			await interaction.reply(
				`You have already claimed your monthly reward. Come back in ${timeLeft.getUTCDate() - 1}d ${timeLeft.getUTCHours()}h ${timeLeft.getUTCMinutes()}m.`,
			);
			return;
		}
		const reward = rewards.monthly() + (data.monthlyStreak ?? 0) * 10;

		await this.container.client.drizzle
			.update(userData)
			.set({
				currency: sql`${userData.currency} + ${reward}`,
				monthlyStreak: sql`${userData.monthlyStreak} + 1`,
				monthlyTimestamp: new Date(),
			})
			.where(eq(userData.userId, interaction.user.id));

		this.container.client.logger.info(
			`${interaction.user.username} (${interaction.user.id}) claimed their monthly reward of ${reward} coins!`,
		);

		await interaction.reply({
			flags: [MessageFlags.IsComponentsV2],
			components: [
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`# 💰 Monthly Reward\n🪙 You claimed your monthly reward of ${reward} coins!
🔢 Your current streak is ${(data.monthlyStreak ?? 0) + 1} months.`,
						),
					)
					.setThumbnailAccessory(
						new ThumbnailBuilder().setURL(interaction.user.avatarURL() ?? interaction.client.user.avatarURL() ?? ""),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("reminder:in:43200:monthly:" + interaction.user.id)
						.setEmoji("⏰")
						.setLabel("Set a reminder for 1 month")
						.setStyle(ButtonStyle.Success),
				),
			],
		});
	}

	private async work(interaction: ChatInputCommandInteraction) {
		const data = await this.container.client.drizzle.query.userData.findFirst({
			where: eq(userData.userId, interaction.user.id),
		});
		if (!data) {
			await interaction.reply("An error occurred while fetching your data, please try again later.");
			return;
		}
		if (data.workTimestamp && Date.now() - data.workTimestamp.getTime() < 10 * 60 * 1000) {
			const timeLeft = new Date(data.workTimestamp.getTime() + 10 * 60 * 1000 - Date.now());
			await interaction.reply(
				`You're on cooldown. Come back in ${timeLeft.getUTCMinutes()}m ${timeLeft.getUTCSeconds()}s.`,
			);
			return;
		}
		const reward = rewards.work();

		await this.container.client.drizzle
			.update(userData)
			.set({
				currency: sql`${userData.currency} + ${reward}`,
				workTimestamp: new Date(),
			})
			.where(eq(userData.userId, interaction.user.id));

		this.container.client.logger.info(
			`${interaction.user.username} (${interaction.user.id}) worked for ${reward} coins!`,
		);

		await interaction.reply({
			flags: [MessageFlags.IsComponentsV2],
			components: [
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`# 💰 Work Reward\n🪙 You worked for ${reward} coins!\n🔢 You can work again in 10 minutes.`,
						),
					)
					.setThumbnailAccessory(
						new ThumbnailBuilder().setURL(interaction.user.avatarURL() ?? interaction.client.user.avatarURL() ?? ""),
					),
				new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true),
				new ActionRowBuilder<ButtonBuilder>().addComponents(
					new ButtonBuilder()
						.setCustomId("reminder:in:10:work:" + interaction.user.id)
						.setEmoji("⏰")
						.setLabel("Set a reminder for 10 minutes")
						.setStyle(ButtonStyle.Success),
				),
			],
		});
	}

	private async give(interaction: ChatInputCommandInteraction) {
		const target = interaction.options.getUser("user");
		const amount = interaction.options.getInteger("amount");
		if (!target || !amount) {
			await interaction.reply("Invalid user or amount");
			return;
		}
		if (target.id === interaction.user.id) {
			await interaction.reply({ content: "You can't give money to yourself", flags: MessageFlags.Ephemeral });
			return;
		}
		if (amount <= 0) {
			await interaction.reply({ content: "Amount must be greater than 0", flags: MessageFlags.Ephemeral });
			return;
		}
		const data = await this.container.client.drizzle.query.userData.findFirst({
			where: eq(userData.userId, interaction.user.id),
		});
		if (!data) {
			await interaction.reply({
				content: "An error occurred while fetching your data, please try again later.",
				flags: MessageFlags.Ephemeral,
			});
			return;
		}
		if (data.currency < amount) {
			await interaction.reply({ content: "You don't have enough coins to give", flags: MessageFlags.Ephemeral });
			return;
		}
		// Remove
		await this.container.manager.removeBalance(interaction.user.id, amount);
		// Add
		await this.container.manager.addBalance(target.id, amount);

		this.container.client.logger.info(
			`${interaction.user.username} (${interaction.user.id}) gave ${amount} coins to ${target.username} (${target.id})`,
		);

		await interaction.reply({
			flags: [MessageFlags.IsComponentsV2],
			components: [
				new SectionBuilder()
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(`# 💰 Give Money\n🪙 You gave ${amount} coins to ${target.username}`),
					)
					.setThumbnailAccessory(
						new ThumbnailBuilder().setURL(interaction.user.avatarURL() ?? interaction.client.user.avatarURL() ?? ""),
					),
			],
		});
	}
}

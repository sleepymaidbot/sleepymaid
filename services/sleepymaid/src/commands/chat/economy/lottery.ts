import { lotteries } from "@sleepymaid/db"
import { Context, SlashCommand } from "@sleepymaid/handler"
import { formatNumber } from "@sleepymaid/shared"
import { getTimeTable } from "@sleepymaid/util"
import { add, getUnixTime } from "date-fns"
import {
	ApplicationCommandOptionType,
	ButtonStyle,
	ChatInputCommandInteraction,
	Colors,
	ComponentType,
	MessageFlags,
	PermissionFlagsBits,
} from "discord.js"
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient"
import DBCheckPrecondtion from "../../../preconditions/dbCheck"
import OwnerOnlyPrecondtion from "../../../preconditions/ownerOnly"

export default class LotteryCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			guildIds: ["862103656852619304"],
			preconditions: [DBCheckPrecondtion, OwnerOnlyPrecondtion],
			data: {
				name: "lottery",
				description: "Base lottery command",
				defaultMemberPermissions: [PermissionFlagsBits.Administrator],
				options: [
					{
						name: "start",
						description: "Start the lottery",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "time",
								description: "The time to wait before the lottery ends",
								type: ApplicationCommandOptionType.String,
								required: true,
							},
							{
								name: "amount",
								description: "The amount of money to put into the lottery",
								type: ApplicationCommandOptionType.Integer,
								required: true,
							},
						],
					},
				],
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		switch (interaction.options.getSubcommand()) {
			case "start":
				await this.start(interaction)
				break
			default:
				await interaction.editReply("Invalid subcommand")
				break
		}
	}

	private async start(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral })
		const time = interaction.options.getString("time", true)
		const date = add(new Date(), getTimeTable(time))
		const amount = interaction.options.getInteger("amount", true)
		if (!interaction.channel?.isSendable()) return
		if (!interaction.guild) return

		const message = await interaction.channel.send({
			embeds: [
				{
					title: "Lottery Started",
					description: `The lottery will end <t:${getUnixTime(date)}:R>`,
					fields: [
						{
							name: "**Amount**",
							value: formatNumber(amount),
						},
					],
					color: Colors.Green,
				},
			],
		})

		const [lottery] = await this.container.drizzle
			.insert(lotteries)
			.values({
				guildId: interaction.guild.id,
				channelId: interaction.channel.id,
				messageId: message.id,
				lotteryAmount: amount,
				effectiveTime: new Date(),
				expiredTime: date,
			})
			.returning()

		if (!lottery) return

		await interaction.editReply({
			content: `Lottery started!`,
		})

		await message.edit({
			components: [
				{
					type: ComponentType.ActionRow,
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Success,
							label: "Enter",
							customId: `lottery:enter:${lottery.lotteryId}`,
						},
					],
				},
			],
		})
	}
}

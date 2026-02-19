import type { Context } from "@sleepymaid/handler"
import { SlashCommand } from "@sleepymaid/handler"
import type { ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommandOptionType, ApplicationCommandType, MessageFlags, resolveColor } from "discord.js"
import type { HelperClient } from "../../../lib/extensions/HelperClient"

export default class SecretCasinoCommand extends SlashCommand<HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			guildIds: ["324284116021542922", "1131653884377579651"],
			data: {
				name: "casino",
				description: "Base command for the casino secret.",
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: "getbuttonorder",
						description: "Get the order of the buttons.",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "control",
								description: "The code of the control room lasers.",
								type: ApplicationCommandOptionType.Integer,
								required: true,
								min_value: 1_234,
								max_value: 4_321,
							},
							{
								name: "mid",
								description: "The code of the middle lasers.",
								type: ApplicationCommandOptionType.Integer,
								required: true,
								min_value: 1_234,
								max_value: 4_321,
							},
						],
					},
				],
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		switch (interaction.options.getSubcommand()) {
			case "getbuttonorder": {
				const iroomNumber = interaction.options.getInteger("control")
				if (!iroomNumber) return
				await this.checkNumber(interaction, iroomNumber)
				const imidNumber = interaction.options.getInteger("mid")
				if (!imidNumber) return
				await this.checkNumber(interaction, imidNumber)

				const roomNumbers = String(iroomNumber).split("")
				const midNumbers = String(imidNumber).split("")

				const finalOrder = [0, 0, 0, 0]
				for (let ii = 0; ii < 4; ii++) {
					const int = Number.parseInt(midNumbers[ii]!)
					const pos = Number.parseInt(roomNumbers[ii]!) - 1
					finalOrder[pos] = int
				}

				if (!interaction.channel) return

				const ephemeral = interaction.channel.id !== "1250961898120413325"

				return interaction.reply({
					embeds: [
						{
							description: `<:greenTick:948620600144982026> The order of the buttons is: \`\`${finalOrder.join(
								" ",
							)}\`\``,
							color: resolveColor("#2f3136"),
						},
					],
					ephemeral,
				})
			}

			default:
				return interaction.reply({
					content: "Invalid subcommand.",
					flags: MessageFlags.Ephemeral,
				})
		}
	}

	private async checkNumber(interaction: ChatInputCommandInteraction<"cached">, number: number) {
		const validNumbers = [
			1_234, 1_243, 1_324, 1_342, 1_423, 1_432, 2_134, 2_143, 2_314, 2_341, 2_413, 2_431, 3_124, 3_142, 3_214, 3_241,
			3_412, 3_421, 4_123, 4_132, 4_213, 4_231, 4_321, 4_312,
		]
		if (validNumbers.includes(number)) return true
		else
			return interaction.reply({
				embeds: [
					{
						description: "<:redX:948606748334358559> Invalid numbers.",
						color: resolveColor("#2f3136"),
					},
				],
				flags: MessageFlags.Ephemeral,
			})
	}
}

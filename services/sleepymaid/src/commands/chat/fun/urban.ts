import { Context, SlashCommand } from "@sleepymaid/handler"
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	InteractionContextType,
} from "discord.js"
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient"

export default class UrbanCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "urban",
				description: "Get a urban dictionary definition",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "word",
						description: "The word to get the definition of",
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		await interaction.deferReply()
		const word = interaction.options.getString("word")
		const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${word}`)
		const data = (await response.json()) as { list: { definition: string }[] | undefined }
		if (!data || !data.list || data.list.length === 0) {
			return interaction.editReply({
				content: `🎲 The word **${word}** is not in the urban dictionary.`,
			})
		}
		return await interaction.editReply({
			content: `🎲 The definition of **${word}** is:\`\`\`${data.list[0]?.definition ?? "No definition found."}\`\`\``,
		})
	}
}

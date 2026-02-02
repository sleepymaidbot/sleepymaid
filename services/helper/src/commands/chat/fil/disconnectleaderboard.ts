import { disconnectCounter } from "@sleepymaid/db"
import type { Context } from "@sleepymaid/handler"
import { SlashCommand } from "@sleepymaid/handler"
import type { ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommandType } from "discord-api-types/v10"
import { desc } from "drizzle-orm"
import type { HelperClient } from "../../../lib/extensions/HelperClient"

export default class RandomBitrateCommand extends SlashCommand<HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			guildIds: ["796534493535928320"],
			data: {
				name: "disconnectleaderboard",
				description: "Disconnect leaderboard for the voice channel.",
				type: ApplicationCommandType.ChatInput,
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		if (!interaction.inCachedGuild()) return
		if (!interaction.guild) return
		await interaction.deferReply()

		const leaderboard = await this.container.client.drizzle
			.select()
			.from(disconnectCounter)
			.orderBy(desc(disconnectCounter.count))
			.limit(10)

		await interaction.editReply({
			content: `# Disconnect leaderboard:\n${leaderboard.map((user, index) => `${index + 1}. <@${user.userId}> - ${user.count}`).join("\n")}`,
			allowedMentions: {
				users: [],
			},
		})
	}
}

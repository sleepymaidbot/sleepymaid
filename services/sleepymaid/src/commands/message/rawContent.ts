import type { Context } from "@sleepymaid/handler"
import { MessageCommand } from "@sleepymaid/handler"
import { getLocalizedProp } from "@sleepymaid/shared"
import type { MessageContextMenuCommandInteraction } from "discord.js"
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, MessageFlags } from "discord.js"
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient"

export default class RatioUserCommand extends MessageCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				...getLocalizedProp("name", "commands.raw_content.name"),
				type: ApplicationCommandType.Message,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
			},
		})
	}

	public override async execute(interaction: MessageContextMenuCommandInteraction) {
		await interaction.reply({
			content: "```" + interaction.targetMessage.content + "```",
			flags: MessageFlags.Ephemeral,
		})
	}
}

import type { Context } from "@sleepymaid/handler"
import { UserCommand } from "@sleepymaid/handler"
import { getLocalizedProp, ratioGuildIds } from "@sleepymaid/shared"
import type { UserContextMenuCommandInteraction } from "discord.js"
import { ApplicationCommandType } from "discord-api-types/v10"
import i18next from "i18next"
import type { HelperClient } from "../../lib/extensions/HelperClient"

export default class RatioUserCommand extends UserCommand<HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			guildIds: ratioGuildIds,
			data: {
				...getLocalizedProp("name", "commands.ratio.name"),
				type: ApplicationCommandType.User,
			},
		})
	}

	public override async execute(interaction: UserContextMenuCommandInteraction) {
		const target = interaction.options.get("user")
		if (target === null) return
		await interaction.reply({
			content: i18next.t("commands.ratio.ratio", {
				lng: interaction.locale,
				target: target.value,
				author: interaction.user.id,
			}),
		})
	}
}

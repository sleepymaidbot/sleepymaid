import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationCommandType } from "discord.js";
import type { HelperClient } from "../../../lib/extensions/HelperClient";

export default class MarcoCommand extends SlashCommand<HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			guildIds: ["1131653884377579651"],
			data: {
				name: "marco",
				description: "Understand the meaning of Marco.",
				type: ApplicationCommandType.ChatInput,
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		const role = interaction.guild.roles.cache.get("1251013376922882120");

		if (!role)
			return interaction.reply({
				content: "Role not found.",
				ephemeral: true,
			});

		if (interaction.member.roles.cache.has(role.id))
			return interaction.reply({
				content: "You already have the role.",
				ephemeral: true,
			});

		await interaction.member.roles.add(role.id);

		return interaction.reply({
			content: `<:greenTick:948620600144982026> You have the role.`,
			ephemeral: true,
		});
	}
}

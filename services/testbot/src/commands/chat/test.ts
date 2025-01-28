import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { MessageFlags, type ChatInputCommandInteraction } from "discord.js";
import type { TestClient } from "../../lib/extensions/TestClient";

export default class ReasonCommand extends SlashCommand<TestClient> {
	public constructor(context: Context<TestClient>) {
		super(context, {
			data: {
				name: "test",
				description: "Test",
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		await interaction.reply({ content: "This command is not yet implemented", flags: MessageFlags.Ephemeral });
	}
}

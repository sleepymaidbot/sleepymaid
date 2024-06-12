import { Context, SlashCommand } from "@sleepymaid/handler";
import { getLocalizedProp } from "@sleepymaid/shared";
import {
	ApplicationCommandOptionType,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	PermissionsBitField,
} from "discord.js";
import { WatcherClient } from "../../lib/extensions/WatcherClient";

export default class ReasonCommand extends SlashCommand<WatcherClient> {
	public constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				...getLocalizedProp("name", "commands.reason.name"),
				...getLocalizedProp("description", "commands.reason.description"),
				defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.ModerateMembers]),
				options: [
					{
						...getLocalizedProp("name", "commands.reason.caseNumber.name"),
						...getLocalizedProp("description", "commands.reason.caseNumber.description"),
						type: ApplicationCommandOptionType.Integer,
						required: true,
					},
					{
						...getLocalizedProp("name", "commands.reason.reason.name"),
						...getLocalizedProp("description", "commands.reason.reason.description"),
						type: ApplicationCommandOptionType.String,
						required: true,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		interaction.reply({ content: "This command is not yet implemented", ephemeral: true });
	}
}

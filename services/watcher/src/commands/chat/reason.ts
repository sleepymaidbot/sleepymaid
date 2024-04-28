import type { SlashCommandInterface } from "@sleepymaid/handler";
import { getLocalizedProp } from "@sleepymaid/shared";
import {
  ApplicationCommandOptionType,
  ChatInputApplicationCommandData,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  PermissionsBitField,
} from "discord.js";

export default class ReasonCommand implements SlashCommandInterface {
  public readonly data = {
    ...getLocalizedProp("name", "commands.reason.name"),
    ...getLocalizedProp("description", "commands.reason.description"),
    defaultMemberPermissions: new PermissionsBitField([
      PermissionFlagsBits.ModerateMembers,
    ]),
    options: [
      {
        ...getLocalizedProp("name", "commands.reason.caseNumber.name"),
        ...getLocalizedProp(
          "description",
          "commands.reason.caseNumber.description",
        ),
        type: ApplicationCommandOptionType.Integer,
        required: true,
      },
      {
        ...getLocalizedProp("name", "commands.reason.reason.name"),
        ...getLocalizedProp(
          "description",
          "commands.reason.reason.description",
        ),
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  } as ChatInputApplicationCommandData;
  public async execute(interaction: ChatInputCommandInteraction<"cached">) {
    interaction.reply({
      content: "This command is not yet implemented",
      ephemeral: true,
    });
  }
}

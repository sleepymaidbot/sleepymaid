import sanitize from "@aero/sanitizer";
import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import type { ChatInputCommandInteraction } from "discord.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	PermissionFlagsBits,
	PermissionsBitField,
} from "discord.js";
import type { SleepyMaidClient } from "../../../lib/extensions/SleepyMaidClient";

export default class PingCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "sanitizeuser",
				description: "Sanitize a user's username.",
				// ...getLocalizedProp('name', 'commands.ping.name'),
				// ...getLocalizedProp('description', 'commands.ping.description'),
				defaultMemberPermissions: new PermissionsBitField([PermissionFlagsBits.ManageNicknames]),
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: "user",
						description: "The user to sanitize.",
						type: ApplicationCommandOptionType.User,
						required: true,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild()) return;
		const member = interaction.options.getMember("user");
		if (!member) return interaction.reply({ content: "User not found.", ephemeral: true });
		const name = member.nickname ?? member.user.username;
		const sanitized = sanitize(name);
		if (name !== sanitized) await member.setNickname(sanitized, "Sanitizer");
		return interaction.reply({ content: `Sanitized <@${member.id}> to \`\`${sanitized}\`\``, ephemeral: true });
	}
}

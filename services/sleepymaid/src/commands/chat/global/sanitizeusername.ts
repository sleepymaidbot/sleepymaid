import type { SlashCommandInterface } from "@sleepymaid/handler";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ChatInputApplicationCommandData,
	ChatInputCommandInteraction,
	PermissionFlagsBits,
	PermissionsBitField,
} from "discord.js";
import type { SleepyMaidClient } from "../../../lib/extensions/SleepyMaidClient";
import sanitize from "@aero/sanitizer";

export default class PingCommand implements SlashCommandInterface {
	public readonly data = {
		name: "sanitizeuser",
		description: "Sanitize a user's username.",
		//...getLocalizedProp('name', 'commands.ping.name'),
		//...getLocalizedProp('description', 'commands.ping.description'),
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
	} as ChatInputApplicationCommandData;

	// @ts-ignore
	public async execute(interaction: ChatInputCommandInteraction, client: SleepyMaidClient) {
		if (!interaction.inCachedGuild()) return;
		const member = interaction.options.getMember("user");
		if (!member) return interaction.reply({ content: "User not found.", ephemeral: true });
		const name = member.nickname ?? member.user.username;
		const sanitized = sanitize(name);
		if (name !== sanitized) await member.setNickname(sanitized, "Sanitizer");
		return interaction.reply({ content: `Sanitized <@${member.id}> to \`\`${sanitized}\`\``, ephemeral: true });
	}
}

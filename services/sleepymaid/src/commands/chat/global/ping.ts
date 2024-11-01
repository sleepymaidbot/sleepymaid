import { SlashCommand, type Context } from "@sleepymaid/handler";
import { getLocalizedProp } from "@sleepymaid/shared";
import type { APIEmbed, ChatInputCommandInteraction, Message } from "discord.js";
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "discord.js";
import i18next from "i18next";
import type { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";

export default class PingCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				...getLocalizedProp("name", "commands.ping.name"),
				...getLocalizedProp("description", "commands.ping.description"),
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const client = this.container.client;
		const timestamp1 = interaction.createdTimestamp;
		await interaction.reply("Pong!");
		const timestamp2 = await interaction.fetchReply().then((message) => (message as Message).createdTimestamp);
		const botLatency = `\`\`\`\n ${Math.floor(timestamp2 - timestamp1)}ms \`\`\``;
		const apiLatency = `\`\`\`\n ${Math.round(client.ws.ping)}ms \`\`\``;
		const embed: APIEmbed = {
			title: "Pong!  🏓",
			fields: [
				{
					name: i18next.t("commands.ping.bot_latency", {
						lng: interaction.locale,
					}),
					value: botLatency,
					inline: true,
				},
				{
					name: i18next.t("commands.ping.api_latency", {
						lng: interaction.locale,
					}),
					value: apiLatency,
					inline: true,
				},
			],
			footer: {
				text: interaction.user.username,
				icon_url: interaction.user.displayAvatarURL(),
			},
			timestamp: new Date(Date.now()).toISOString(),
		};
		await interaction.editReply({
			content: null,
			embeds: [embed],
		});
	}
}

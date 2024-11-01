import * as os from "node:os";
import process from "node:process";
import type { Context } from "@sleepymaid/handler";
import { SlashCommand } from "@sleepymaid/handler";
import { prettyBytes, shell } from "@sleepymaid/util";
import { ApplicationCommandType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";
import { ApplicationIntegrationType, version as discordJSVersion, InteractionContextType } from "discord.js";
import type { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";

export default class InfoCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "info",
				description: "Gets information about the bot",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const client = this.container.client;
		const currentCommit = (await shell("git rev-parse HEAD")).stdout.replace("\n", "") || "unknown";
		let repoUrl = (await shell("git remote get-url origin")).stdout.replace("\n", "") || "unknown";
		if (repoUrl.includes(".git")) repoUrl = repoUrl.slice(0, Math.max(0, repoUrl.length - 4));

		const uptime = Date.now() - client.uptime!;
		const formatUptime = Math.floor(uptime / 1_000);

		await interaction.reply({
			embeds: [
				{
					title: "Bot Info:",
					fields: [
						{
							name: "**Uptime**",
							value: `<t:${formatUptime}:R>`,
							inline: true,
						},
						{
							name: "**Memory Usage**",
							value: `System: ${prettyBytes(os.totalmem() - os.freemem(), {
								binary: true,
							})}/${prettyBytes(os.totalmem(), {
								binary: true,
							})}\nHeap: ${prettyBytes(process.memoryUsage().heapUsed, {
								binary: true,
							})}/${prettyBytes(process.memoryUsage().heapTotal, {
								binary: true,
							})}`,
							inline: true,
						},
						{
							name: "**Servers**",
							value: client.guilds.cache.size.toLocaleString(),
							inline: true,
						},
						{
							name: "**Users**",
							value: client.users.cache.size.toLocaleString(),
							inline: true,
						},
						{
							name: "**Discord.js Version**",
							value: discordJSVersion,
							inline: true,
						},
						{
							name: "**Node.js Version**",
							value: process.version.slice(1),
							inline: true,
						},
						{
							name: "**Current Commit**",
							value: `[${currentCommit.slice(0, 7)}](${repoUrl}/commit/${currentCommit})`,
							inline: true,
						},
						{
							name: "**Credits**",
							value: "Emotes from [Icons](https://discord.gg/9AtkECMX2P)",
							inline: true,
						},
					],
				},
			],
		});
	}
}

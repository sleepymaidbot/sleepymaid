import { SlashCommand, type Context } from "@sleepymaid/handler";
import type { ChatInputCommandInteraction } from "discord.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ButtonStyle,
	Colors,
	ComponentType,
	InteractionContextType,
} from "discord.js";
import type { SleepyMaidClient } from "@/lib/extensions/SleepyMaidClient";
import { GameDig } from "gamedig";
import { getUnixTime, sub } from "date-fns";

const serversData = {
	ma: {
		ip: "15.235.112.50",
		port: 27016,
		fancyName: "Murderer's Arena",
		url: "https://www.qcgames.org/english/index.php?t=servers",
	},
	qc: {
		ip: "15.235.112.50",
		port: 27015,
		fancyName: "Québec Murder",
		url: "https://www.qcgames.org/french/index.php?t=servers",
	},
};

export default class QCGServersCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				// ...getLocalizedProp("name", "commands.ping.name"),
				// ...getLocalizedProp("description", "commands.ping.description"),
				name: "qcgservers",
				description: "Query a Québec Game server",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "server",
						description: "The server to query",
						type: ApplicationCommandOptionType.String,
						required: true,
						choices: [
							{
								name: "Murderer's Arena",
								value: "ma",
							},
							{
								name: "Québec Murder",
								value: "qc",
							},
						],
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const server = interaction.options.getString("server") as keyof typeof serversData;

		if (!server) return;

		const data = serversData[server];

		const query = await GameDig.query({
			type: "garrysmod",
			host: data.ip,
			port: data.port,
			givenPortOnly: true,
			maxRetries: 3,
		});

		return await interaction.reply({
			embeds: [
				{
					title: data.fancyName,
					description: query.name,
					color: Colors.Blue,
					fields: [
						{
							name: "Player Count",
							value: query.players.length.toString() + "/" + query.maxplayers.toString(),
							inline: true,
						},
						{
							name: "Map",
							value: query.map,
							inline: true,
						},
						{
							name: "Players Online",
							value: (() => {
								let string = "";
								for (const player of query.players) {
									if (player.name === "") continue;

									if (player.raw !== null) {
										// @ts-expect-error - GameDig raw type are a mess
										const raw: { score: number | null; time: number | null } = player.raw;
										const timestamp = getUnixTime(
											sub(new Date(), {
												seconds: raw.time ?? 0,
											}),
										);
										string += `${player.name} (${raw.score ?? "0"} / <t:${timestamp}:R>)\n`;
									} else {
										string += `${player.name}\n`;
									}
								}
								return string;
							})(),
							inline: false,
						},
					],
				},
			],
			components: [
				{
					type: 1,
					components: [
						{
							type: ComponentType.Button,
							style: ButtonStyle.Link,
							label: "Click here to view the server list.",
							url: data.url,
							emoji: { name: "🔗" },
						},
					],
				},
			],
		});
	}
}

import { SlashCommand, type Context } from "@sleepymaid/handler";
import type {
	APIActionRowComponent,
	APIEmbed,
	APIMessageActionRowComponent,
	ChatInputCommandInteraction,
} from "discord.js";
import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	ApplicationIntegrationType,
	ButtonStyle,
	Colors,
	ComponentType,
	InteractionContextType,
} from "discord.js";
import type { SleepyMaidClient } from "../../../lib/SleepyMaidClient";
import { GameDig, QueryResult } from "gamedig";
import { getUnixTime, sub } from "date-fns";

enum Game {
	GarrysMod = "garrysmod",
}

type ServerData = {
	ip: string;
	port: number;
	fancyName: string;
	url?: string;
	game: Game;
};

const serversData: Record<string, ServerData> = {
	ma: {
		ip: "15.235.112.50",
		port: 27016,
		fancyName: "Murderer's Arena",
		url: "https://www.qcgames.org/english/index.php?t=servers",
		game: Game.GarrysMod,
	},
	qc: {
		ip: "15.235.112.50",
		port: 27015,
		fancyName: "Québec Murder",
		url: "https://www.qcgames.org/french/index.php?t=servers",
		game: Game.GarrysMod,
	},
};

const gamesFormat: Record<Game, (data: ServerData, query: QueryResult) => APIEmbed> = {
	[Game.GarrysMod]: (data, query) => {
		return {
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
		};
	},
};

export default class ServersCommand extends SlashCommand<SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				// ...getLocalizedProp("name", "commands.ping.name"),
				// ...getLocalizedProp("description", "commands.ping.description"),
				name: "servers",
				description: "Query from a list of game servers",
				type: ApplicationCommandType.ChatInput,
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					{
						name: "server",
						description: "The server to query",
						type: ApplicationCommandOptionType.String,
						required: true,
						choices: Object.keys(serversData).map((key) => ({
							name: serversData[key as keyof typeof serversData]!.fancyName,
							value: key,
						})),
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const server = interaction.options.getString("server") as keyof typeof serversData;

		if (!server) return;

		const data: ServerData | undefined = serversData[server];

		if (!data) return;

		const query = await GameDig.query({
			type: data.game,
			host: data.ip,
			port: data.port,
			givenPortOnly: true,
			maxRetries: 10,
			requestRules: true,
		});

		const func = gamesFormat[data.game];
		const embed = func(data, query);
		const components: APIActionRowComponent<APIMessageActionRowComponent>[] = [];
		if (data.url) {
			components.push({
				type: ComponentType.ActionRow,
				components: [
					{
						type: ComponentType.Button,
						style: ButtonStyle.Link,
						label: "Click here to view the server list.",
						url: data.url,
						emoji: { name: "🔗" },
					},
				],
			});
		}

		return await interaction.reply({
			embeds: [embed],
			components,
		});
	}
}

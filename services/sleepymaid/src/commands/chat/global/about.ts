import * as os from "node:os";
import process from "node:process";
import { Context, SlashCommand } from "@sleepymaid/handler";
import { SleepyMaidClient } from "../../../lib/SleepyMaidClient";
import {
	APIEmbed,
	APIEmbedField,
	ApplicationCommandOptionType,
	ApplicationIntegrationType,
	ChatInputCommandInteraction,
	Colors,
	version as discordJSVersion,
	InteractionContextType,
} from "discord.js";
import { prettyBytes, shell } from "@sleepymaid/util";
import i18next from "i18next";

export default class extends SlashCommand<SleepyMaidClient> {
	constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			data: {
				name: "about",
				description: "About SleepyMaid",
				integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
				contexts: [InteractionContextType.BotDM, InteractionContextType.Guild, InteractionContextType.PrivateChannel],
				options: [
					// Discord Info
					{
						name: "user",
						description: "The user to get information about",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "user",
								description: "The user to get information about",
								type: ApplicationCommandOptionType.User,
							},
						],
					},
					{
						name: "role",
						description: "The role to get information about",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "role",
								description: "The role to get information about",
								type: ApplicationCommandOptionType.Role,
								required: true,
							},
						],
					},
					{
						name: "server",
						description: "The server to get information about",
						type: ApplicationCommandOptionType.Subcommand,
					},

					// Bot Info
					{
						name: "info",
						description: "Get information about the bot",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "support",
						description: "Get the bot support server link",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "ping",
						description: "Get the bot's ping",
						type: ApplicationCommandOptionType.Subcommand,
					},
				],
			},
		});
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const subcommand = interaction.options.getSubcommand();
		switch (subcommand) {
			case "user":
				return this.user(interaction);
			case "role":
				return this.role(interaction);
			case "server":
				return this.server(interaction);
			case "info":
				return this.info(interaction);
			case "support":
				return this.support(interaction);
			case "ping":
				return this.ping(interaction);
		}
	}

	private async user(interaction: ChatInputCommandInteraction) {
		const user = interaction.options.getUser("user") ?? interaction.user;
		const member = await interaction.guild?.members.fetch(user).catch(() => null);

		const embed: APIEmbed = {
			title: "User Info",
			author: {
				name: interaction.user.displayName,
				icon_url: interaction.user.displayAvatarURL(),
			},
			fields: [
				{
					name: "**Username**",
					value: user.username,
					inline: true,
				},
				{
					name: "**Display Name**",
					value: user.displayName,
					inline: true,
				},
				{
					name: "**ID**",
					value: user.id,
					inline: true,
				},
				{
					name: "**Created At**",
					value: `<t:${Math.floor(user.createdTimestamp / 1_000)}:R>`,
					inline: true,
				},
			],
		};

		if (!member) {
			return interaction.reply({
				embeds: [
					{
						...embed,
						color: Colors.DarkPurple,
					},
				],
				ephemeral: true,
			});
		}

		const memberFields: APIEmbedField[] = [
			{
				name: "**Joined At**",
				value: `<t:${Math.floor(member.joinedTimestamp! / 1_000)}:R>`,
				inline: true,
			},
			{
				name: "**Roles**",
				value: member.roles.cache.map((role) => `<@&${role.id}>`).join(", "),
				inline: true,
			},
		];

		return interaction.reply({
			embeds: [
				{
					...embed,
					fields: [...(embed.fields ?? []), ...(memberFields ?? [])],
					color: member.displayColor,
				},
			],
		});
	}

	private async role(interaction: ChatInputCommandInteraction) {
		if (!interaction.inCachedGuild() || !interaction.inGuild())
			return interaction.reply({
				content: "This command can only be used in a server",
				ephemeral: true,
			});

		const role = interaction.options.getRole("role", true);

		const embed: APIEmbed = {
			title: "Role Info",
			author: {
				name: interaction.user.displayName,
				icon_url: interaction.user.displayAvatarURL(),
			},
			fields: [
				{
					name: "**Name**",
					value: role.name,
					inline: true,
				},
				{
					name: "**ID**",
					value: role.id,
					inline: true,
				},
				{
					name: "**Created At**",
					value: `<t:${Math.floor(role.createdTimestamp! / 1_000)}:R>`,
					inline: true,
				},
				{
					name: "**Color**",
					value: role.hexColor,
					inline: true,
				},
				{
					name: "**Members**",
					value: role.members.size.toLocaleString(),
					inline: true,
				},
				{
					name: "**Permissions**",
					value: role.permissions
						.toArray()
						.map((perm) => `\`${perm}\``)
						.join(", "),
					inline: true,
				},
			],
		};

		return interaction.reply({
			embeds: [
				{
					...embed,
					color: role.color,
				},
			],
		});
	}

	private async server(interaction: ChatInputCommandInteraction) {
		const guild = interaction.guild;
		if (!guild)
			return interaction.reply({
				content: "This command can only be used in a server",
				ephemeral: true,
			});

		if (!interaction.inCachedGuild() || !interaction.inGuild())
			return interaction.reply({
				content: "This command can only be used in a server",
				ephemeral: true,
			});

		const embed: APIEmbed = {
			title: "Server Info",
			author: {
				name: interaction.user.displayName,
				icon_url: interaction.user.displayAvatarURL(),
			},
			color: Colors.DarkPurple,
			fields: [
				{
					name: "**Name**",
					value: guild.name,
					inline: true,
				},
				{
					name: "**ID**",
					value: guild.id,
					inline: true,
				},
				{
					name: "**Created At**",
					value: `<t:${Math.floor(guild.createdTimestamp! / 1_000)}:R>`,
					inline: true,
				},
				{
					name: "**Owner**",
					value: `<@${guild.ownerId}>`,
					inline: true,
				},
				{
					name: "**Members**",
					value: guild.memberCount.toLocaleString(),
					inline: true,
				},
				{
					name: "**Channels**",
					value: guild.channels.cache.size.toLocaleString(),
					inline: true,
				},
				{
					name: "**Roles**",
					value: guild.roles.cache.size.toLocaleString(),
					inline: true,
				},
				{
					name: "**Emojis**",
					value: guild.emojis.cache.size.toLocaleString(),
					inline: true,
				},
				{
					name: "**Stickers**",
					value: guild.stickers.cache.size.toLocaleString(),
					inline: true,
				},
				{
					name: "**Boost Count**",
					value: guild.premiumSubscriptionCount?.toString() ?? "0",
					inline: true,
				},
			],
		};

		return interaction.reply({
			embeds: [embed],
		});
	}

	private async info(interaction: ChatInputCommandInteraction) {
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
							name: "**Support Server**",
							value: "[Click Here](https://discord.gg/UexTYbVFM3)",
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

	private async support(interaction: ChatInputCommandInteraction) {
		return interaction.reply({
			content: "[Click Here](https://discord.gg/UexTYbVFM3)",
			ephemeral: true,
		});
	}

	private async ping(interaction: ChatInputCommandInteraction) {
		const client = this.container.client;
		const timestamp1 = interaction.createdTimestamp;
		await interaction.reply("Pong!");
		const timestamp2 = (await interaction.fetchReply()).createdTimestamp;
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

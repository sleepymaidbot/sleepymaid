import { Context, SlashCommand } from "@sleepymaid/handler"
import { APIEmbed, ChatInputCommandInteraction, MessageFlags } from "discord.js"
import { WatcherClient } from "../../lib/extensions/WatcherClient"

export default class extends SlashCommand<WatcherClient> {
	constructor(context: Context<WatcherClient>) {
		super(context, {
			data: {
				name: "ping",
				description: "Ping the bot",
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction) {
		const client = this.container.client
		const timestamp1 = interaction.createdTimestamp
		await interaction.reply({ content: "Pong!", flags: MessageFlags.Ephemeral })
		const timestamp2 = (await interaction.fetchReply()).createdTimestamp
		const botLatency = `\`\`\`\n ${Math.floor(timestamp2 - timestamp1)}ms \`\`\``
		const apiLatency = `\`\`\`\n ${Math.round(client.ws.ping)}ms \`\`\``
		const embed: APIEmbed = {
			title: "Pong!  🏓",
			fields: [
				{
					name: "Bot Latency",
					value: botLatency,
					inline: true,
				},
				{
					name: "API Latency",
					value: apiLatency,
					inline: true,
				},
			],
			footer: {
				text: interaction.user.username,
				icon_url: interaction.user.displayAvatarURL(),
			},
			timestamp: new Date(Date.now()).toISOString(),
		}
		await interaction.editReply({
			content: null,
			embeds: [embed],
		})
	}
}

import { randomBitrate } from "@sleepymaid/db"
import type { Context } from "@sleepymaid/handler"
import { SlashCommand } from "@sleepymaid/handler"
import type { ChatInputCommandInteraction } from "discord.js"
import { ApplicationCommandOptionType, ChannelType } from "discord.js"
import { ApplicationCommandType } from "discord-api-types/v10"
import { and, eq } from "drizzle-orm"
import type { HelperClient } from "../../../lib/extensions/HelperClient"

export default class RandomBitrateCommand extends SlashCommand<HelperClient> {
	public constructor(context: Context<HelperClient>) {
		super(context, {
			guildIds: ["796534493535928320"],
			data: {
				name: "randombitrate",
				description: "Random bitrate for the voice channel.",
				type: ApplicationCommandType.ChatInput,
				options: [
					{
						name: "now",
						description: "Randomize the bitrate now.",
						type: ApplicationCommandOptionType.Subcommand,
					},
					{
						name: "toggle",
						description: "Toggle the random bitrate in a channel.",
						type: ApplicationCommandOptionType.Subcommand,
						options: [
							{
								name: "channel",
								description: "The channel to toggle the random bitrate.",
								type: ApplicationCommandOptionType.Channel,
								channel_types: [ChannelType.GuildVoice],
								required: false,
							},
							{
								name: "state",
								description: "The state of the random bitrate.",
								type: ApplicationCommandOptionType.Boolean,
								required: false,
							},
						],
					},
				],
			},
		})
	}

	public override async execute(interaction: ChatInputCommandInteraction<"cached">) {
		if (!interaction.inCachedGuild()) return
		if (!interaction.guild) return
		const client = this.container.client
		if (interaction.options.getSubcommand() === "now") {
			if (!interaction.member.voice.channel)
				return interaction.reply("You need to be in a voice channel to use this command.")
			const maxBitrate = interaction.guild.maximumBitrate
			const minBitrate = 8_000
			// Random bitrate between min and maxBitrate
			const bitrate = Math.floor(Math.random() * (maxBitrate - minBitrate + 1) + minBitrate)
			// Round up the birate by to get the last 3 digit to be 0
			const roundedBitrate = Math.ceil(bitrate / 1_000) * 1_000
			await interaction.member.voice.channel.setBitrate(roundedBitrate)
			await interaction.reply(`The bitrate for the voice channel has been set to ${Math.ceil(bitrate / 1_000)}kbps.`)
		} else if (interaction.options.getSubcommand() === "toggle") {
			let target = interaction.options.getChannel("channel", false)
			const state = interaction.options.getBoolean("state", false)
			if (!target) {
				if (!interaction.member.voice.channel)
					return interaction.reply("You need to be in a voice channel to use this command.")
				target = interaction.member.voice.channel
			}

			if (target.type !== ChannelType.GuildVoice) return interaction.reply("The channel must be a voice channel.")
			if (target.members.size === 0) return interaction.reply("There are no members in the voice channel.")
			const channelSettings = await client.drizzle.query.randomBitrate.findFirst({
				where: and(eq(randomBitrate.guildId, interaction.guild.id), eq(randomBitrate.channelId, target.id)),
			})
			if (!channelSettings) {
				if (state === true || !state) {
					await client.drizzle.insert(randomBitrate).values({
						guildId: interaction.guild.id,
						channelId: target.id,
						enabled: true,
					})
					await interaction.reply(`The random bitrate has been enabled for ${target.toString()}.`)
				} else {
					await interaction.reply(`The random bitrate is already disabled for ${target.toString()}.`)
				}
			} else if (state === true) {
				await client.drizzle
					.update(randomBitrate)
					.set({ enabled: true })
					.where(and(eq(randomBitrate.guildId, interaction.guild.id), eq(randomBitrate.channelId, target.id)))
				await interaction.reply(`The random bitrate has been enabled for ${target.toString()}.`)
			} else if (!state || state === false) {
				await client.drizzle
					.delete(randomBitrate)
					.where(and(eq(randomBitrate.guildId, interaction.guild.id), eq(randomBitrate.channelId, target.id)))
				await interaction.reply(`The random bitrate has been disabled for ${target.toString()}.`)
				await target.setBitrate(interaction.guild.maximumBitrate)
			} else {
				return interaction.reply("Invalid state.")
			}
		} else {
			return interaction.reply("You need to be in a voice channel to use this command.")
		}

		return null
	}
}

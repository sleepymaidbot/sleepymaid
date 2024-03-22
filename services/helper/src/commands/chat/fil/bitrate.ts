import type { SlashCommandInterface } from '@sleepymaid/handler';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { ChatInputCommandInteraction, ChatInputApplicationCommandData } from 'discord.js';
import type { HelperClient } from '../../../lib/extensions/HelperClient';

export default class QCGSecretSetupCommand implements SlashCommandInterface {
	public readonly guildIds = ['796534493535928320', '821717486217986098'];
	public readonly data = {
		name: 'randombitrate',
		description: 'Random bitrate for the voice channel.',
		type: ApplicationCommandType.ChatInput,
	} as ChatInputApplicationCommandData;

	// @ts-ignore
	public async execute(interaction: ChatInputCommandInteraction, client: HelperClient) {
		if (!interaction.inCachedGuild()) return;
		if (!interaction.guild) return;
		if (!interaction.member.voice.channel)
			return interaction.reply('You need to be in a voice channel to use this command.');
		const maxBitrate = interaction.guild.maximumBitrate;
		const minBitrate = 8000;
		// Random bitrate between min and maxBitrate
		const bitrate = Math.floor(Math.random() * (maxBitrate - minBitrate + 1) + minBitrate);
		await interaction.member.voice.channel.setBitrate(bitrate);
		await interaction.reply(`The bitrate for the voice channel has been set to ${bitrate}kbps.`);
	}
}

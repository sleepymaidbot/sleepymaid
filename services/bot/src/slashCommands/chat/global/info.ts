import { SlashCommandInterface } from '@sleepymaid/handler';
import { ChatInputApplicationCommandData, version as discordJSVersion } from 'discord.js';
import { ApplicationCommandType } from 'discord-api-types/v10';
import { prettyBytes, shell } from '@sleepymaid/util';
import * as os from 'os';

export default class InfoCommand implements SlashCommandInterface {
	public readonly data = {
		name: 'info',
		description: 'Gets information about the bot',
		type: ApplicationCommandType.ChatInput,
	} as ChatInputApplicationCommandData;

	public async execute(interaction, client) {
		const currentCommit = (await shell('git rev-parse HEAD')).stdout.replace('\n', '');
		let repoUrl = (await shell('git remote get-url origin')).stdout.replace('\n', '');
		if (repoUrl.includes('.git')) repoUrl = repoUrl.substring(0, repoUrl.length - 4);

		const uptime = Date.now() - client.uptime;
		const formatUptime = Math.floor(uptime / 1000);

		await interaction.reply({
			embeds: [
				{
					title: 'Bot Info:',
					fields: [
						{
							name: '**Uptime**',
							value: `<t:${formatUptime}:R>`,
							inline: true,
						},
						{
							name: '**Memory Usage**',
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
							name: '**Servers**',
							value: client.guilds.cache.size.toLocaleString(),
							inline: true,
						},
						{
							name: '**Users**',
							value: client.users.cache.size.toLocaleString(),
							inline: true,
						},
						{
							name: '**Discord.js Version**',
							value: discordJSVersion,
							inline: true,
						},
						{
							name: '**Node.js Version**',
							value: process.version.slice(1),
							inline: true,
						},
						{
							name: '**Current Commit**',
							value: `[${currentCommit.substring(0, 7)}](${repoUrl}/commit/${currentCommit})`,
							inline: true,
						},
						{
							name: '**Credits**',
							value: 'Emotes from [Icons](https://discord.gg/9AtkECMX2P)',
							inline: true,
						},
					],
				},
			],
		});
	}
}

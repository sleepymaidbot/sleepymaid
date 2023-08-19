import { unlink } from 'fs';
import type { ListenerInterface } from '@sleepymaid/handler';
import type { Message } from 'discord.js';
import type { BotClient } from '../../lib/extensions/BotClient';
import { shell } from '@sleepymaid/util';
import { join } from 'path';
import { Result } from '@sapphire/result';

const sites = [
	'tiktok.com',
	'redd.it',
	'v.redd.it',
	'reddit.com',
	'twitter.com',
	't.co',
	'facebook.com',
	'instagram.com',
	'fb.watch',
];

export default class VidListener implements ListenerInterface {
	public readonly name = 'messageCreate';
	public readonly once = false;

	public async execute(message: Message, client: BotClient) {
		if (message.author.bot) return;

		const args = message.content.split(' ');

		for (const arg of args) {
			if (arg.startsWith('https://') && sites.some((a) => arg.includes(a))) {
				const nameReturn = await Result.fromAsync(
					async () => await shell('yt-dlp --print filename -o "%(id)s.%(ext)s" ' + arg),
				);
				if (nameReturn.isErr()) {
					return client.logger.error(nameReturn.unwrapErr() as Error);
				}
				const fileName = nameReturn.unwrap().stdout.trim();
				const dlReturn = await Result.fromAsync(
					async () =>
						await shell(`yt-dlp -P "${join(__dirname, '../../../downloads/')}" -o "${fileName}" "${arg}" -f mp4`),
				);
				if (dlReturn.isErr()) return client.logger.error(dlReturn.unwrapErr() as Error);
				const messageReturn = await Result.fromAsync(
					async () =>
						await message.reply({
							files: [
								{
									attachment: join(__dirname, `../../../downloads/${fileName}`),
									name: fileName,
								},
							],
						}),
				);
				if (messageReturn.isErr()) return client.logger.error(messageReturn.unwrapErr() as Error);

				const unlinkReturn = Result.from(() => unlink(join(__dirname, `../../../downloads/${fileName}`), (err) => err));
				if (unlinkReturn.isErr()) return client.logger.error(unlinkReturn.unwrapErr() as Error);
			}
		}
	}
}
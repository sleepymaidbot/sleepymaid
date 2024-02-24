import { unlink } from 'fs';
import type { ListenerInterface } from '@sleepymaid/handler';
import type { Message } from 'discord.js';
import type { SleepyMaidClient } from '../../lib/extensions/SleepyMaidClient';
import { shell } from '@sleepymaid/util';
import { join } from 'path';
import { Result } from '@sapphire/result';

const sites = [
	'tiktok.com',
	'https://redd.it',
	'https://v.redd.it',
	'reddit.com',
	'https://t.co',
	'facebook.com',
	'instagram.com',
	'nicovideo.jp/watch',
	'https://twitter.com',
	'https://x.com',
	'https://mobile.twitter.com',
];

const sitesDelEmbed = [
	'https://redd.it',
	'https://v.redd.it',
	'reddit.com',
	'https://twitter.com',
	'https://x.com',
	'https://mobile.twitter.com',
	'https://vm.tiktok.com',
	'https://vt.tiktok.com',
	'https://www.tiktok.com',
	'https://tiktok.com',
	'instagram.com',
];

const enabled = true;

export default class VidListener implements ListenerInterface {
	public readonly name = 'messageCreate';
	public readonly once = false;

	public async execute(message: Message, client: SleepyMaidClient) {
		if (!enabled) return;
		if (message.author.bot) return;

		const args = message.content.split(' ');

		for (let arg of args) {
			if (arg.includes('tiktok.com/t/')) arg = arg.replaceAll('www.tiktok.com', 'vm.tiktok.com');

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
						await message
							.reply({
								files: [
									{
										attachment: join(__dirname, `../../../downloads/${fileName}`),
										name: fileName,
									},
								],
							})
							.then(() => {
								if (sitesDelEmbed.some((a) => arg.includes(a))) {
									message.suppressEmbeds(true).catch(console.error);
								}
							}),
				);
				if (messageReturn.isErr()) return client.logger.error(messageReturn.unwrapErr() as Error);

				const unlinkReturn = Result.from(() => unlink(join(__dirname, `../../../downloads/${fileName}`), (err) => err));
				if (unlinkReturn.isErr()) return client.logger.error(unlinkReturn.unwrapErr() as Error);
			}
		}
	}
}

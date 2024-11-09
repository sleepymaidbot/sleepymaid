/* eslint-disable unicorn/prefer-module */
import { unlink } from "node:fs";
import { join } from "node:path";
import { Result } from "@sapphire/result";
import type { Context } from "@sleepymaid/handler";
import { Listener } from "@sleepymaid/handler";
import { shell } from "@sleepymaid/util";
import type { Message } from "discord.js";
import type { SleepyMaidClient } from "../../lib/SleepyMaidClient";

const sites = [
	"tiktok.com",
	"https://redd.it",
	"https://v.redd.it",
	"reddit.com",
	"https://t.co",
	"facebook.com",
	"instagram.com",
	"nicovideo.jp/watch",
	"https://twitter.com",
	"https://x.com",
	"https://mobile.twitter.com",
];

const sitesDelEmbed = [
	"https://redd.it",
	"https://v.redd.it",
	"reddit.com",
	"https://twitter.com",
	"https://x.com",
	"https://mobile.twitter.com",
	"https://vm.tiktok.com",
	"https://vt.tiktok.com",
	"https://www.tiktok.com",
	"https://tiktok.com",
	"instagram.com",
];

const enabled = true;

export default class VidListener extends Listener<"messageCreate", SleepyMaidClient> {
	public constructor(context: Context<SleepyMaidClient>) {
		super(context, {
			name: "messageCreate",
			once: false,
		});
	}

	public override async execute(message: Message) {
		if (!enabled) return;
		if (message.author.bot) return;
		const client = this.container.client;

		const args = message.content.split(" ");

		for (let arg of args) {
			if (arg.includes("tiktok.com/t/")) arg = arg.replaceAll("www.tiktok.com", "vm.tiktok.com");
			if (arg.includes("x.com")) arg = arg.replaceAll("x.com", "twitter.com");

			if (arg.startsWith("https://") && sites.some((a) => arg.includes(a))) {
				const nameReturn = await Result.fromAsync(async () =>
					shell('yt-dlp --print filename -o "%(id)s.%(ext)s" ' + arg),
				);
				if (nameReturn.isErr()) {
					client.logger.error(nameReturn.unwrapErr() as Error);
					return;
				}

				const fileName = nameReturn.unwrap().stdout.trim();
				const dlReturn = await Result.fromAsync(async () =>
					shell(`yt-dlp -P "${join(__dirname, "../../../downloads/")}" -o "${fileName}" "${arg}" -f mp4`),
				);
				if (dlReturn.isErr()) {
					client.logger.error(dlReturn.unwrapErr() as Error);
					return;
				}

				const messageReturn = await Result.fromAsync(async () =>
					message
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
				if (messageReturn.isErr()) {
					client.logger.error(messageReturn.unwrapErr() as Error);
					return;
				}

				// eslint-disable-next-line promise/prefer-await-to-callbacks
				const unlinkReturn = Result.from(() => unlink(join(__dirname, `../../../downloads/${fileName}`), (err) => err));
				if (unlinkReturn.isErr()) {
					client.logger.error(unlinkReturn.unwrapErr() as Error);
					return;
				}
			}
		}
	}
}

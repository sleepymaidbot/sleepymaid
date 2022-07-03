import { unlink } from 'fs'
import { ListenerInterface } from '@sleepymaid/handler'
import { Message } from 'discord.js'
import { BotClient } from '../../lib/extensions/BotClient'
import { shell } from '@sleepymaid/util'
import { join } from 'path'
import { Result } from '@sapphire/result'

const sites = [
	'tiktok.com',
	'https://redd.it',
	'https://v.redd.it',
	'reddit.com',
	'twitter.com',
	'https://t.co',
	'facebook.com',
	'instagram.com'
]

export default class VidListener implements ListenerInterface {
	public readonly name = 'messageCreate'
	public readonly once = false

	public async execute(message: Message, client: BotClient) {
		if (message.author.bot) return

		const args = message.content.split(' ')

		for (const arg of args) {
			if (arg.startsWith('https://') && sites.some((a) => arg.includes(a))) {
				const nameReturn = await Result.fromAsync(
					async () =>
						await shell('yt-dlp --print filename -o "%(id)s.%(ext)s" ' + arg)
				)
				if (nameReturn.isErr()) {
					return client.logger.error(nameReturn.unwrapErr() as Error)
				}
				const fileName = nameReturn.unwrap().stdout.trim()
				const dlReturn = await Result.fromAsync(
					async () =>
						await shell(
							`yt-dlp -P "${join(
								__dirname,
								'../../../downloads/'
							)}" -o "${fileName}" "${arg}"`
						)
				)
				if (dlReturn.isErr())
					return client.logger.error(dlReturn.unwrapErr() as Error)
				const messageReturn = await Result.fromAsync(
					async () =>
						await message.reply({
							files: [
								{
									attachment: `./downloads/${fileName}`,
									name: fileName
								}
							]
						})
				)
				if (messageReturn.isErr())
					return client.logger.error(messageReturn.unwrapErr() as Error)

				const unlinkReturn = Result.from(() =>
					unlink(`./downloads/${fileName}`, (err) => err)
				)
				if (unlinkReturn.isErr())
					return client.logger.error(unlinkReturn.unwrapErr() as Error)
			}
		}
	}
}

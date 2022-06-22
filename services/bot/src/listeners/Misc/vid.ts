import { unlink } from 'fs'
import { Listener } from '@sleepymaid/handler'
import { Message } from 'discord.js'
import { BotClient } from '../../lib/extensions/BotClient'
import { shell } from '@sleepymaid/util'
import { join } from 'path'
import { from, fromAsync, isErr } from '@sapphire/result'

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

export default new Listener(
	{
		name: 'messageCreate',
		once: false
	},
	{
		async run(message: Message, client: BotClient) {
			if (message.author.bot) return

			const args = message.content.split(' ')

			for (const arg of args) {
				if (arg.startsWith('https://') && sites.some((a) => arg.includes(a))) {
					const nameReturn = await fromAsync(
						async () =>
							await shell('yt-dlp --print filename -o "%(id)s.%(ext)s" ' + arg)
					)
					if (isErr(nameReturn))
						return client.logger.error(nameReturn.error as Error)
					const fileName = nameReturn.value.stdout.trim()
					const dlReturn = await fromAsync(
						async () =>
							await shell(
								`yt-dlp -P "${join(
									__dirname,
									'../../../downloads/'
								)}" -o "${fileName}" "${arg}"`
							)
					)
					if (isErr(dlReturn))
						return client.logger.error(dlReturn.error as Error)
					const messageReturn = await fromAsync(
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
					if (isErr(messageReturn))
						return client.logger.error(messageReturn.error as Error)

					const unlinkReturn = from(() =>
						unlink(`./downloads/${fileName}`, (err) => err)
					)
					if (isErr(unlinkReturn))
						return client.logger.error(unlinkReturn.error as Error)
				}
			}
		}
	}
)

import * as fs from 'fs'
import { exec } from 'child_process'

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

module.exports = {
	name: 'messageCreate',
	once: false,

	async execute(message, client) {
		return
		if (message.author.bot) return

		const argv = message.content.split(' ')

		for (const arg of argv) {
			if (arg.startsWith('https://') && sites.some((a) => arg.includes(a))) {
				try {
					let fileName
					exec(
						`yt-dlp --get-filename -o %(id)s.%(ext)s ${arg}`,
						async (error, stdout) => {
							if (error) return client.logger.error(error)
							fileName = stdout.trim()
							exec(
								`yt-dlp -o "${fileName}" -P "./downloads/" "${arg}"`,
								async (error) => {
									if (error) return client.logger.error(error)
									await message
										.reply({
											files: [
												{
													attachment: `./downloads/${fileName}`,
													name: fileName
												}
											]
										})
										.then(() => {
											fs.unlink(`./downloads/${fileName}`, (err) => {
												if (err) return client.logger.error(err)
											})
										})
								}
							)
						}
					)
				} catch (e) {
					client.logger.error(e)
				}
			}
		}
	}
}

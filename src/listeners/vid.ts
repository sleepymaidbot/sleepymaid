import util from 'util'
import fs from 'fs'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const execFile = util.promisify(require('child_process').execFile)

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
		if (message.author.bot) return

		const argv = message.content.split(' ')

		for (const arg of argv) {
			if (arg.startsWith('https://') && sites.some((a) => arg.includes(a))) {
				try {
					let fileName
					await execFile(
						'youtube-dl',
						['-o', '%(id)s.%(ext)s', '--get-filename', arg],
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						async (error, stdout, stderr) => {
							if (error) {
								return client.logger.error(error)
							}
							fileName = stdout.trim()
							await execFile(
								'youtube-dl',
								['-o', `./downloads/${fileName}`, arg],
								// eslint-disable-next-line @typescript-eslint/no-unused-vars
								async (error, stdout, stderr) => {
									if (error) {
										throw error
									}
									await message
										.reply({
											files: [
												{
													attachment: `./downloads/${fileName}`,
													name: fileName
												}
											]
										})
										// eslint-disable-next-line @typescript-eslint/no-unused-vars
										.then((msg) => {
											fs.unlink(`./downloads/${fileName}`, (err) => {
												if (err) throw err
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

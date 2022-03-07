import { unlink } from 'fs'
import { promisify } from 'util'
import { execFile as MyExecFile } from 'child_process'
const execFile = promisify(MyExecFile)

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

		const args = message.content.split(' ')

		for (const arg of args) {
			if (arg.startsWith('https://') && sites.some((a) => arg.includes(a))) {
				try {
					const { stdout } = await execFile(`yt-dlp`, [
						'--get-filename',
						'-o',
						'"%(id)s.%(ext)s"',
						arg
					])
					const fileName = await stdout.trim()
					await execFile(`yt-dlp`, ['-o', `./downloads/${fileName}`, `${arg}`])
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
							unlink(`./downloads/${fileName}`, (err) => {
								if (err) return client.logger.error(err)
							})
						})
						.catch((error) => client.logger.error(error))
				} catch (e) {
					client.logger.error(e)
				}
			}
		}
	}
}

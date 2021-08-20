import { Command } from 'discord-akairo'
import { slashGuildsIds } from '../../config/lists'
import fs from 'fs'
import util from 'util'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const execFile = util.promisify(require('child_process').execFile)

export default class downloadCommand extends Command {
	constructor() {
		super('download', {
			aliases: ['dl', 'download'],
			slash: false,
			slashGuilds: slashGuildsIds,
			description: 'Download a video.',
			prefix: '!',
			args: [
				{
					id: 'video',
					type: 'string'
				}
			],
			slashOptions: [
				{
					name: 'video',
					description: 'The video you want to download',
					required: true,
					type: 'STRING'
				}
			]
		})
	}

	async exec(message, args) {
		if (!args.video) {
			message.reply({
				content: 'You must provide a valid video link',
				ephemeral: true
			})
		} else {
			try {
				let fileName
				await execFile(
					'youtube-dl',
					['-o', '%(id)s.%(ext)s', '--get-filename', args.video],
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					async (error, stdout, stderr) => {
						if (error) {
							throw error
						}
						fileName = stdout.trim()
						await execFile(
							'youtube-dl',
							['-o', `./downloads/${fileName}`, args.video],
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
				console.error(e)
			}
		}
	}

	async execSlash(message, args) {
		if (!args.video) {
			message.reply({
				content: 'You must provide a valid video link',
				ephemeral: true
			})
		} else {
			try {
				let fileName
				message.defer()
				await execFile(
					'youtube-dl',
					['-o', '%(id)s.%(ext)s', '--get-filename', args.video],
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					async (error, stdout, stderr) => {
						if (error) {
							throw error
						}
						fileName = stdout.trim()
						await execFile(
							'youtube-dl',
							['-o', `./downloads/${fileName}`, args.video],
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
				console.error(e)
			}
		}
	}
}

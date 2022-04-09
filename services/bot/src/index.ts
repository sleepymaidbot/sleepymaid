import { config } from '@sleepymaid/config'
import { resolve } from 'path'
import { BotClient } from './lib/BotClient'
;(async () => {
	const client: BotClient = new BotClient()

	client.on('ready', async () => {
		await client.loadHandlers({
			commands: {
				folder: resolve(__dirname, './slashCommands')
			},
			listeners: {
				folder: resolve(__dirname, './listeners')
			},
			tasks: {
				folder: resolve(__dirname, './tasks')
			}
		})
		await client.registerApplicationCommandsPermissions()
	})

	await client.login(config.token)
})()

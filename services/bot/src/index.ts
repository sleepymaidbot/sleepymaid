import { config } from '@sleepymaid/config'
import { resolve } from 'path'
import { BotClient } from './lib/BotClient'
void (() => {
	const client: BotClient = new BotClient()

	client.loadHandlers({
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

	client.localizer.loadLanguage()

	client.once('ready', async () => {
		await client.registerApplicationCommandsPermissions()
	})

	client.login(config.token)
})()

import { ConfigManager } from '@sleepymaid/config'
import { HandlerClient } from '@sleepymaid/handler'
import { GatewayIntentBits } from 'discord.js'
import { resolve } from 'path'
;(async () => {
	const client = new HandlerClient(
		{
			devServerId: '821717486217986098'
		},
		{
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildBans,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildMessages
			]
		}
	)

	client.loadHandlers({
		commands: {
			folder: resolve(__dirname, './commands')
		},
		listeners: {
			folder: resolve(__dirname, './listeners')
		},
		tasks: {
			folder: resolve(__dirname, './tasks')
		}
	})

	client.on('ready', async () => {
		client.logger.info('Ready!')
	})

	const configManager = new ConfigManager()

	const configs = await configManager.initConfig()

	await client.login(configs['bot'].token)
})().catch(console.error)
